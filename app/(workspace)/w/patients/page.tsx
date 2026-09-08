"use client";

// CONSTRAINT — record-keeping only: display and edit vitals/allergies/meds,
// but no interpretation, no flagging, no dosage or triage suggestions.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PatientVisitBadge } from "@/components/dashboard/patients/patient-visit-badge";
import { useAppointmentsRange } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { useQueueEntries } from "@/hooks/use-queue";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { cn } from "@/lib/utils";
import {
  calculateAge,
  GENDER_LABEL,
  initials,
  isHereToday,
} from "@/lib/patient-utils";
import type { Appointment } from "@/lib/types/appointments";

type PatientView = "day" | "handled";

export default function WorkspacePatientsPage() {
  const session = useWorkspaceSession();
  const [view, setView] = useState<PatientView>("day");

  // Full query objects (not just data) — the empty state must not flash
  // while a background refetch is in flight after client-side navigation.
  const patientsQuery = usePatients();
  const entriesQuery = useQueueEntries(session.departmentId);
  const patients = patientsQuery.data ?? [];
  const entries = entriesQuery.data ?? [];

  // Handled list = completed appointments for this doctor (stable staffId
  // join — never names). Querying a wide range is fine server-side; the
  // demo dataset is small. Each patient shows their most recent completed
  // appointment.
  const today = new Date().toISOString().slice(0, 10);
  const handledQuery = useAppointmentsRange("2020-01-01", today, {
    staffId: session.staffId,
    enabled: Boolean(session.staffId),
  });
  const handled = useMemo(() => {
    const latest = new Map<string, Appointment>();
    for (const a of handledQuery.data ?? []) {
      if (a.status !== "completed") continue;
      const current = latest.get(a.patientId);
      if (!current || a.scheduledAt > current.scheduledAt) latest.set(a.patientId, a);
    }
    return [...latest.values()].sort((a, b) =>
      b.scheduledAt.localeCompare(a.scheduledAt),
    );
  }, [handledQuery.data]);

  // Latch: only show an empty state once the queries backing the ACTIVE view
  // have been idle for a beat. On route remount TanStack serves cached data
  // instantly while revalidating, and the first painted frame can be
  // isFetching=false with stale (empty) data — so we never settle on the
  // first idle frame. The timeout gives a mount-triggered refetch time to
  // start (deps change → cleanup cancels) and finish.
  const [dataSettled, setDataSettled] = useState(false);
  const resolving =
    patientsQuery.isPending ||
    entriesQuery.isPending ||
    (view === "handled" && handledQuery.isPending);
  const fetching =
    patientsQuery.isFetching ||
    entriesQuery.isFetching ||
    (view === "handled" && handledQuery.isFetching);
  useEffect(() => {
    if (resolving || fetching) return;
    const t = setTimeout(() => setDataSettled(true), 250);
    return () => clearTimeout(t);
  }, [resolving, fetching]);

  // Patients this doctor is currently seeing (in_consultation AND the queue
  // entry belongs to them — matched by stable clinicianId, name as fallback
  // for rows seeded before the identity fix) or with a current visit in the
  // department today.
  const doctorEntryIds = new Set(
    entries
      .filter(
        (e) =>
          e.status === "in_consultation" &&
          (e.clinicianId
            ? e.clinicianId === session.staffId
            : e.clinician === session.name),
      )
      .map((e) => e.patientName), // keyed by name — mock doesn't have patientId on entries
  );

  const myPatients = patients.filter(
    (p) =>
      isHereToday(p) &&
      (p.currentVisit?.departmentId === session.departmentId ||
        doctorEntryIds.has(p.name)),
  );

  const emptyText =
    view === "day"
      ? {
          title: "No current patients",
          hint: "Patients you call from the queue will appear here.",
        }
      : {
          title: "No previously handled patients yet",
          hint: "Completed appointments for you will appear here.",
        };

  // Shimmer while there could still be data in flight; the empty state only
  // shows once the queries have settled (see dataSettled above).
  const list =
    view === "day"
      ? (myPatients.map((p) => ({ patient: p, appointment: null })) as {
          patient: (typeof myPatients)[number];
          appointment: Appointment | null;
        }[])
      : handled.map((a) => ({
          appointment: a,
          patient: null,
        }));
  const showSkeleton = list.length === 0 && !dataSettled;

  return (
    <>
      <DashboardHeader title="My Patients" />

      <div className="flex-1 overflow-y-auto p-6">
        {/* View toggle */}
        <div className="mb-4 inline-flex rounded-lg border border-border bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setView("day")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "day"
                ? "bg-brand text-white"
                : "text-fg-muted hover:text-fg",
            )}
          >
            My day
          </button>
          <button
            type="button"
            onClick={() => setView("handled")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "handled"
                ? "bg-brand text-white"
                : "text-fg-muted hover:text-fg",
            )}
          >
            <History className="size-3.5" />
            Previously handled
            {handled.length > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  view === "handled"
                    ? "bg-white/20 text-white"
                    : "bg-surface-muted text-fg-secondary",
                )}
              >
                {handled.length}
              </span>
            )}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {/* column header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
            <div className="col-span-4">Patient</div>
            <div className="col-span-2">Age / Gender</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-3 text-right">
              {view === "day" ? "Status" : "Last seen"}
            </div>
          </div>

          {showSkeleton ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4">
                  <div className="col-span-4 h-4 w-32 animate-pulse rounded bg-surface-muted" />
                  <div className="col-span-2 h-4 w-20 animate-pulse rounded bg-surface-muted" />
                  <div className="col-span-3 h-4 w-24 animate-pulse rounded bg-surface-muted" />
                  <div className="col-span-3 ml-auto h-5 w-28 animate-pulse rounded-full bg-surface-muted" />
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                {view === "day" ? (
                  <Users className="h-6 w-6 text-fg-muted" />
                ) : (
                  <History className="h-6 w-6 text-fg-muted" />
                )}
              </div>
              <div>
                <p className="font-medium text-fg">{emptyText.title}</p>
                <p className="text-sm text-fg-muted">{emptyText.hint}</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((row) => {
                if (row.patient) {
                  const patient = row.patient;
                  return (
                    <li key={patient.id}>
                      <Link
                        href={`/w/patients/${patient.id}`}
                        className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-muted"
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                            {initials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-fg">
                              {patient.name}
                            </div>
                            <div className="text-xs text-fg-muted">
                              {patient.patientNumber}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-fg-secondary">
                          {calculateAge(patient.dateOfBirth)} ·{" "}
                          {GENDER_LABEL[patient.gender]}
                        </div>
                        <div className="col-span-3 truncate text-sm text-fg-muted">
                          {patient.phone}
                        </div>
                        <div className="col-span-3 flex justify-end">
                          <PatientVisitBadge patient={patient} />
                        </div>
                      </Link>
                    </li>
                  );
                }
                const a = row.appointment as Appointment;
                return (
                  <li key={a.patientId}>
                    <Link
                      href={`/w/patients/${a.patientId}`}
                      className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-muted"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                          {initials(a.patientName)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-fg">
                            {a.patientName}
                          </div>
                          <div className="text-xs text-fg-muted">
                            {a.reference}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-fg-secondary">
                        —
                      </div>
                      <div className="col-span-3 truncate text-sm text-fg-muted">
                        {a.departmentName}
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-fg-secondary">
                          <History className="size-3 text-fg-placeholder" />
                          {a.scheduledAt.slice(0, 10)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
