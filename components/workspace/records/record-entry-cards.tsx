"use client";

// Read-only renderers for the three record kinds on the patient's history.
// They display what was authored and nothing else: no severity colouring, no
// out-of-range highlighting, no summarising or re-wording of clinical text.
// See lib/types/records.ts.

import type {
  LabResultRecord,
  PrescriptionRecord,
  VisitRecord,
} from "@/lib/types/records";
import { formatJoined, formatShortDate } from "@/lib/format";

function Field({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-fg-secondary">{value}</p>
    </div>
  );
}

export function VisitRecordCard({ record }: { record: VisitRecord }) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/40 p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-bold text-fg">
          {record.visit.departmentName}
        </h3>
        <p className="text-xs text-fg-muted">
          {formatJoined(record.recordedAt)} · {record.author.name}
        </p>
      </header>

      <div className="space-y-3 text-sm">
        <Field label="Presenting complaint" value={record.presentingComplaint} />
        <Field label="Examination / observations" value={record.examination} />
        <Field label="Diagnosis" value={record.diagnosis} />
        <Field label="Plan / notes" value={record.plan} />
        <Field label="Visit summary" value={record.summary} />
      </div>
    </article>
  );
}

export function PrescriptionRecordCard({
  record,
}: {
  record: PrescriptionRecord;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/40 p-4 text-sm">
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-bold text-fg">{record.medication}</h3>
        <p className="text-xs text-fg-muted">
          {formatShortDate(record.prescribedAt)} · {record.author.name}
        </p>
      </header>

      <dl className="grid grid-cols-3 gap-3">
        {(
          [
            ["Dose", record.dose],
            ["Frequency", record.frequency],
            ["Duration", record.duration],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase tracking-wide text-fg-placeholder">
              {label}
            </dt>
            <dd className="text-fg-secondary">{value || "—"}</dd>
          </div>
        ))}
      </dl>

      {record.instructions && (
        <p className="mt-3 whitespace-pre-wrap text-fg-secondary">
          {record.instructions}
        </p>
      )}
    </article>
  );
}

export function LabResultRecordCard({ record }: { record: LabResultRecord }) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/40 p-4 text-sm">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-bold text-fg">
          {record.testName}
          {record.specimen && (
            <span className="ml-2 font-normal text-fg-muted">
              {record.specimen}
            </span>
          )}
        </h3>
        <p className="text-xs text-fg-muted">
          {formatJoined(record.reportedAt)} · {record.author.name}
        </p>
      </header>

      <ul className="space-y-1.5">
        {record.values.map((v) => (
          <li
            key={v.label}
            className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-border/60 pb-1.5 last:border-0 last:pb-0"
          >
            <span className="text-fg-secondary">{v.label}</span>
            <span className="text-fg">
              {v.value}
              {/* The lab's own printed range, shown verbatim. Never compared
                  against the value by this app. */}
              {v.referenceRange && (
                <span className="ml-2 text-xs text-fg-muted">
                  ref {v.referenceRange}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {record.notes && (
        <p className="mt-3 whitespace-pre-wrap text-fg-muted">{record.notes}</p>
      )}
    </article>
  );
}
