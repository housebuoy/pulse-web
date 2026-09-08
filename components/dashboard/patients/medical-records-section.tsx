"use client";

// Medical record history + authoring (web issue #9). Doctors record a
// consultation note / prescription right from the patient detail page; the
// same records are what the patient sees on mobile. Keep the codebase
// constraint: record-keeping only — no interpretation, no advice.

import { Children, useState, type FormEvent, type ReactNode } from "react";
import { Plus, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddPrescription,
  useAddVisitNote,
  usePatientRecords,
} from "@/hooks/use-patient-records";
import type { PrescriptionRecord, VisitRecord } from "@/lib/types/records";

export function MedicalRecordsSection({ patientId }: { patientId: string }) {
  const { data, isLoading } = usePatientRecords(patientId);
  const addVisit = useAddVisitNote();
  const addPrescription = useAddPrescription();

  const [visitOpen, setVisitOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [medication, setMedication] = useState("");
  const [dose, setDose] = useState("");

  const visits = data?.visits ?? [];
  const prescriptions = data?.prescriptions ?? [];
  const labResults = data?.labResults ?? [];

  const submitVisit = (e: FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    addVisit.mutate(
      { patientId, summary: summary.trim() },
      {
        onSuccess: () => {
          toast.success("Visit note saved");
          setSummary("");
          setVisitOpen(false);
        },
        onError: () => toast.error("Could not save the visit note"),
      },
    );
  };

  const submitPrescription = (e: FormEvent) => {
    e.preventDefault();
    if (!medication.trim() || !dose.trim()) return;
    addPrescription.mutate(
      { patientId, medication: medication.trim(), dose: dose.trim() },
      {
        onSuccess: () => {
          toast.success("Prescription saved");
          setMedication("");
          setDose("");
          setRxOpen(false);
        },
        onError: () => toast.error("Could not save the prescription"),
      },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
          <Stethoscope className="size-4 text-fg-muted" />
          Medical records
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setVisitOpen(true)}
            disabled={addVisit.isPending}
          >
            <Plus className="size-3.5" /> Visit note
          </Button>
          <Button size="sm" onClick={() => setRxOpen(true)} disabled={addPrescription.isPending}>
            <Plus className="size-3.5" /> Prescription
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
        </div>
      ) : visits.length === 0 &&
        prescriptions.length === 0 &&
        labResults.length === 0 ? (
        <p className="py-4 text-sm text-fg-muted">
          No medical records yet. Add a visit note or prescription above.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RecordList
            title={`Visits (${visits.length})`}
            empty="No visits recorded."
          >
            {visits.map((v) => (
              <VisitItem key={v.id} visit={v} />
            ))}
          </RecordList>

          <div className="space-y-5">
            <RecordList
              title={`Prescriptions (${prescriptions.length})`}
              empty="No prescriptions recorded."
            >
              {prescriptions.map((p) => (
                <PrescriptionItem key={p.id} rx={p} />
              ))}
            </RecordList>

            {labResults.length > 0 && (
              <RecordList title={`Lab results (${labResults.length})`}>
                {labResults.map((l) => (
                  <li
                    key={l.id}
                    className="rounded-lg border border-border bg-surface-muted p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-fg">
                        {l.testName}
                      </span>
                      <span className="shrink-0 text-xs text-fg-muted">
                        {l.date} · {l.orderingDoctor || "—"}
                      </span>
                    </div>
                    {l.values.length > 0 && (
                      <dl className="mt-2 space-y-1">
                        {l.values.map((val, i) => (
                          <div
                            key={i}
                            className="flex items-baseline justify-between gap-2 text-xs"
                          >
                            <dt className="text-fg-secondary">{val.name}</dt>
                            <dd className="text-fg-muted">
                              {val.value}
                              {val.unit ? ` ${val.unit}` : ""}
                              {val.referenceRange
                                ? ` (ref ${val.referenceRange})`
                                : ""}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </li>
                ))}
              </RecordList>
            )}
          </div>
        </div>
      )}

      {/* Visit note dialog */}
      <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add visit note</DialogTitle>
            <DialogDescription>
              Consultation summary for this visit. Dated today unless changed
              later on the backend.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitVisit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-fg">Summary</span>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="History, examination findings, plan…"
                rows={5}
                required
              />
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisitOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addVisit.isPending || !summary.trim()}>
                {addVisit.isPending ? "Saving…" : "Save note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Prescription dialog */}
      <Dialog open={rxOpen} onOpenChange={setRxOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add prescription</DialogTitle>
            <DialogDescription>
              Medication and dose — dated today unless changed later on the
              backend.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPrescription} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-fg">Medication</span>
              <Input
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="e.g. Lisinopril"
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-fg">Dose</span>
              <Input
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 10 mg once daily"
                required
              />
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRxOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addPrescription.isPending ||
                  !medication.trim() ||
                  !dose.trim()
                }
              >
                {addPrescription.isPending ? "Saving…" : "Save prescription"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecordList({
  title,
  empty,
  children,
}: {
  title: string;
  empty?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
        {title}
      </h3>
      {empty && Children.count(children) === 0 ? (
        <p className="text-xs text-fg-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </section>
  );
}

function VisitItem({ visit }: { visit: VisitRecord }) {
  return (
    <li className="rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-fg">{visit.doctor}</span>
        <span className="shrink-0 text-xs text-fg-muted">
          {visit.date} · {visit.department}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">
        {visit.summary}
      </p>
    </li>
  );
}

function PrescriptionItem({ rx }: { rx: PrescriptionRecord }) {
  return (
    <li className="rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-fg">{rx.medication}</span>
        <span className="shrink-0 text-xs text-fg-muted">{rx.date}</span>
      </div>
      <p className="mt-1 text-xs text-fg-secondary">
        {rx.dose} · {rx.prescribingDoctor || "—"}
      </p>
    </li>
  );
}
