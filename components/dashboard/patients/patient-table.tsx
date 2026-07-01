"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { PatientVisitBadge } from "./patient-visit-badge";
import { GENDER_LABEL, calculateAge, initials } from "@/lib/patient-utils";
import type { Patient } from "@/lib/types/patients";

function HeaderRow() {
  return (
    <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
      <div className="col-span-3">Name</div>
      <div className="col-span-2">Patient #</div>
      <div className="col-span-2">Age / Gender</div>
      <div className="col-span-2">Phone</div>
      <div className="col-span-3 text-right">Status</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4">
      <div className="col-span-3 h-4 w-32 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-2 h-4 w-20 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-2 h-4 w-20 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-2 h-4 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-3 ml-auto h-5 w-28 animate-pulse rounded-full bg-surface-muted" />
    </div>
  );
}

export function PatientTable({
  patients,
  isLoading,
}: {
  patients: Patient[];
  isLoading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <HeaderRow />

      {isLoading && patients.length === 0 ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <Users className="h-6 w-6 text-fg-muted" />
          </div>
          <div>
            <p className="font-medium text-fg">No patients found</p>
            <p className="text-sm text-fg-muted">
              Nothing matches the current filters.
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {patients.map((patient) => (
            <li key={patient.id}>
              <Link
                href={`/d/patients/${patient.id}`}
                className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-subtle"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                    {initials(patient.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-fg">
                      {patient.name}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-sm tabular-nums text-fg-secondary">
                  {patient.patientNumber}
                </div>
                <div className="col-span-2 text-sm text-fg-secondary">
                  {calculateAge(patient.dateOfBirth)} · {GENDER_LABEL[patient.gender]}
                </div>
                <div className="col-span-2 truncate text-sm text-fg-muted">
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
  );
}
