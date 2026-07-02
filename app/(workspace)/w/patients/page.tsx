"use client";

// CONSTRAINT — record-keeping only: display and edit vitals/allergies/meds,
// but no interpretation, no flagging, no dosage or triage suggestions.

import Link from "next/link";
import { Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PatientVisitBadge } from "@/components/dashboard/patients/patient-visit-badge";
import { usePatients } from "@/hooks/use-patients";
import { useQueueEntries } from "@/hooks/use-queue";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { calculateAge, initials, isHereToday } from "@/lib/patient-utils";
import { GENDER_LABEL } from "@/lib/patient-utils";

export default function WorkspacePatientsPage() {
  const session = useWorkspaceSession();
  const { data: patients = [], isLoading } = usePatients();
  const { data: entries = [] } = useQueueEntries(session.departmentId);

  // Patients this doctor is currently seeing (in_consultation AND their name
  // on the queue entry) or who have a current visit in the department today.
  const doctorEntryIds = new Set(
    entries
      .filter(
        (e) =>
          e.status === "in_consultation" && e.clinician === session.name,
      )
      .map((e) => e.patientName), // keyed by name — mock doesn't have patientId on entries
  );

  const myPatients = patients.filter(
    (p) =>
      isHereToday(p) &&
      (p.currentVisit?.departmentId === session.departmentId ||
        doctorEntryIds.has(p.name)),
  );

  return (
    <>
      <DashboardHeader title="My Patients" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {/* column header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
            <div className="col-span-4">Patient</div>
            <div className="col-span-2">Age / Gender</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          {isLoading && myPatients.length === 0 ? (
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
          ) : myPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                <Users className="h-6 w-6 text-fg-muted" />
              </div>
              <div>
                <p className="font-medium text-fg">No current patients</p>
                <p className="text-sm text-fg-muted">
                  Patients you call from the queue will appear here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {myPatients.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/w/patients/${patient.id}`}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-subtle"
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
