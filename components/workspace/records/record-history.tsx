"use client";

// The patient's record history, read-only. Same three record kinds the
// patient sees on the mobile Records tab, read staff-scoped so the doctor has
// context before authoring anything.
//
// Display is deliberately neutral: newest first, verbatim text, no
// interpretation, no flagging, no derived summaries. See lib/types/records.ts.

import { useState } from "react";
import type { ReactNode } from "react";
import { FilterTab } from "@/components/dashboard/filter-tabs";
import { usePatientRecords } from "@/hooks/use-records";
import {
  LabResultRecordCard,
  PrescriptionRecordCard,
  VisitRecordCard,
} from "@/components/workspace/records/record-entry-cards";

type RecordTab = "visits" | "prescriptions" | "labs";

export function RecordHistory({
  patientId,
  action,
}: {
  patientId: string;
  /** Optional authoring control rendered in the card header. Doctor-only —
   *  the caller decides whether to pass one. */
  action?: ReactNode;
}) {
  const [tab, setTab] = useState<RecordTab>("visits");
  const { data, isLoading, isError } = usePatientRecords(patientId);

  const visits = data?.visits ?? [];
  const prescriptions = data?.prescriptions ?? [];
  const labResults = data?.labResults ?? [];

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-fg">Record history</h2>
          <p className="text-xs text-fg-muted">
            Past records for this patient, as authored.
          </p>
        </div>
        {action}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterTab
          active={tab === "visits"}
          label="Visits"
          count={visits.length}
          onClick={() => setTab("visits")}
        />
        <FilterTab
          active={tab === "prescriptions"}
          label="Prescriptions"
          count={prescriptions.length}
          onClick={() => setTab("prescriptions")}
        />
        <FilterTab
          active={tab === "labs"}
          label="Lab results"
          count={labResults.length}
          onClick={() => setTab("labs")}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-fg-muted">Loading records…</p>
      ) : isError ? (
        <p className="text-sm text-fg-muted">
          Couldn&apos;t load this patient&apos;s records.
        </p>
      ) : tab === "visits" ? (
        visits.length === 0 ? (
          <p className="text-sm text-fg-muted">No visit records on file.</p>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <VisitRecordCard key={v.id} record={v} />
            ))}
          </div>
        )
      ) : tab === "prescriptions" ? (
        prescriptions.length === 0 ? (
          <p className="text-sm text-fg-muted">No prescriptions on file.</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <PrescriptionRecordCard key={p.id} record={p} />
            ))}
          </div>
        )
      ) : labResults.length === 0 ? (
        <p className="text-sm text-fg-muted">No lab results on file.</p>
      ) : (
        <div className="space-y-3">
          {labResults.map((l) => (
            <LabResultRecordCard key={l.id} record={l} />
          ))}
        </div>
      )}
    </div>
  );
}
