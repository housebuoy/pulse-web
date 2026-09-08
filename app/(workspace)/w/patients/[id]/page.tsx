// Doctor workspace — patient file. Reuses the shared patient-detail components
// so clinical data (vitals, allergies, meds) is captured exactly once.
// CONSTRAINT: record-keeping only — display and let staff edit; no
// interpretation, no risk flagging, no dosage suggestions. See lib/types/patients.ts.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PatientVisitBadge } from "@/components/dashboard/patients/patient-visit-badge";
import { PatientFormDialog } from "@/components/dashboard/patients/patient-form-dialog";
import { ClinicalRecordDialog } from "@/components/dashboard/patients/clinical-record-dialog";
import { VitalsDialog } from "@/components/dashboard/patients/vitals-dialog";
import { RecordHistory } from "@/components/workspace/records/record-history";
import { ConsultationRecordDialog } from "@/components/workspace/records/consultation-record-dialog";
import { MedicalRecordsSection } from "@/components/dashboard/patients/medical-records-section";

import {
  usePatient,
  useRecordVitals,
  useUpdateClinicalRecord,
  useUpdatePatient,
} from "@/hooks/use-patients";
import {
  PrescriptionsFailedError,
  useCanAuthorRecords,
  useSaveConsultation,
} from "@/hooks/use-records";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import {
  GENDER_LABEL,
  VISIT_STATUS_LABEL,
  calculateAge,
  initials,
} from "@/lib/patient-utils";
import { formatJoined, formatShortDate, formatTime } from "@/lib/format";

export default function WorkspacePatientFilePage() {
  const { id } = useParams<{ id: string }>();
  const session = useWorkspaceSession();
  const { data: patient, isLoading } = usePatient(id);
  const updatePatient = useUpdatePatient();
  const updateClinicalRecord = useUpdateClinicalRecord();
  const recordVitals = useRecordVitals();
  // Authoring is doctor-only. /w is already doctor-gated by its layout; this
  // is the per-action check, and the write layer rejects non-doctors too.
  const canAuthorRecords = useCanAuthorRecords();
  const saveConsultation = useSaveConsultation();

  const [editOpen, setEditOpen] = useState(false);
  const [clinicalOpen, setClinicalOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Patient file" />

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Link
            href="/w/patients"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" />
            My Patients
          </Link>

          {isLoading && !patient ? (
            <DetailSkeleton lines={5} />
          ) : !patient ? (
            <p className="text-sm text-fg-muted">Patient not found.</p>
          ) : (
            <>
              {/* header */}
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand">
                    {initials(patient.name)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-fg">{patient.name}</h1>
                    <p className="text-sm text-fg-muted">
                      {patient.patientNumber} · {calculateAge(patient.dateOfBirth)} yrs ·{" "}
                      {GENDER_LABEL[patient.gender]}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </div>

              {/* status + links */}
              <div className="flex flex-wrap items-center gap-2">
                <PatientVisitBadge patient={patient} />
                {patient.currentVisit && (
                  <Link
                    href={`/w/queue`}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-subtle"
                  >
                    View in queue ↗
                  </Link>
                )}
              </div>

              {/* demographics */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-3 text-sm font-bold text-fg">Demographics &amp; contact</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-fg-secondary">
                    <Phone className="size-4 text-fg-muted" />
                    {patient.phone}
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2 text-fg-secondary">
                      <Mail className="size-4 text-fg-muted" />
                      {patient.email}
                    </div>
                  )}
                  {patient.address && (
                    <div className="col-span-2 flex items-center gap-2 text-fg-secondary">
                      <MapPin className="size-4 text-fg-muted" />
                      {patient.address}
                    </div>
                  )}
                  <div className="text-fg-muted">
                    Date of birth{" "}
                    <span className="text-fg-secondary">{patient.dateOfBirth}</span>
                  </div>
                  <div className="text-fg-muted">
                    Registered{" "}
                    <span className="text-fg-secondary">
                      {formatShortDate(patient.registeredAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* clinical record — record-keeping only, no interpretation */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-fg">Clinical record</h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setVitalsOpen(true)}>
                      <Plus className="size-4" />
                      Record vitals
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setClinicalOpen(true)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                      Blood type
                    </p>
                    <p className="text-fg-secondary">{patient.bloodType || "Not recorded"}</p>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                      Latest vitals
                    </p>
                    {patient.latestVitals ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["Blood pressure", patient.latestVitals.bloodPressure],
                          ["Temperature", patient.latestVitals.temperature],
                          ["Pulse", patient.latestVitals.pulse],
                          ["Weight", patient.latestVitals.weight],
                        ].map(([lbl, val]) => (
                          <div key={lbl}>
                            <div className="font-bold text-fg">{val}</div>
                            <div className="text-xs text-fg-muted">{lbl}</div>
                          </div>
                        ))}
                        <p className="col-span-2 sm:col-span-4 text-xs text-fg-muted">
                          Recorded {formatJoined(patient.latestVitals.recordedAt)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-fg-muted">No vitals on file.</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                      Allergies
                    </p>
                    {patient.allergies.length === 0 ? (
                      <p className="text-fg-muted">None on file.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {patient.allergies.map((a) => (
                          <StatusBadge key={a} tone="warning" label={a} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                      Current medications
                    </p>
                    {patient.currentMedications.length === 0 ? (
                      <p className="text-fg-muted">None on file.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {patient.currentMedications.map((m, i) => (
                          <li
                            key={`${m.name}-${i}`}
                            className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2"
                          >
                            <span className="font-medium text-fg">{m.name}</span>
                            <span className="text-fg-muted">
                              {m.dose} · {m.frequency}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* record history — read-only context before authoring. Same
                  data the patient reads on the mobile Records tab. */}
              <RecordHistory
                patientId={patient.id}
                action={
                  canAuthorRecords ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        // Drop any record carried over from a previous
                        // partial save before starting a new consultation.
                        saveConsultation.startOver();
                        setConsultationOpen(true);
                      }}
                    >
                      <Plus className="size-4" />
                      Record consultation
                    </Button>
                  ) : undefined
                }
              />
              {/* medical records (notes / prescriptions / labs) */}
              <MedicalRecordsSection patientId={patient.id} />

              {/* current visit */}
              {patient.currentVisit && (
                <div className="rounded-xl border border-border bg-surface p-5">
                  <h2 className="mb-3 text-sm font-bold text-fg">Current visit</h2>
                  <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5 text-sm">
                    <span className="text-fg">
                      {VISIT_STATUS_LABEL[patient.currentVisit.status]} ·{" "}
                      <Link
                        href={`/d/departments?dept=${patient.currentVisit.departmentId}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {patient.currentVisit.departmentName}
                      </Link>
                    </span>
                    <span className="text-fg-muted">
                      Since {formatTime(patient.currentVisit.since)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {patient && (
        <>
          <PatientFormDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            title="Edit patient"
            submitLabel="Save changes"
            isSubmitting={updatePatient.isPending}
            initialValues={patient}
            onSubmit={(values) =>
              updatePatient.mutate(
                { id: patient.id, ...values },
                { onSuccess: () => setEditOpen(false) },
              )
            }
          />
          <ClinicalRecordDialog
            open={clinicalOpen}
            onOpenChange={setClinicalOpen}
            allergies={patient.allergies}
            medications={patient.currentMedications}
            isSubmitting={updateClinicalRecord.isPending}
            onSubmit={(values) =>
              updateClinicalRecord.mutate(
                { id: patient.id, ...values },
                { onSuccess: () => setClinicalOpen(false) },
              )
            }
          />
          {canAuthorRecords && (
            <ConsultationRecordDialog
              open={consultationOpen}
              onOpenChange={setConsultationOpen}
              patientName={patient.name}
              contextLabel={
                patient.currentVisit
                  ? `${patient.currentVisit.departmentName} · in since ${formatTime(
                      patient.currentVisit.since,
                    )}`
                  : "No open visit — recorded against today"
              }
              isSubmitting={saveConsultation.isPending}
              error={
                !saveConsultation.isError
                  ? undefined
                  : saveConsultation.error instanceof PrescriptionsFailedError
                    ? "The consultation was saved. Its prescriptions were not — saving again adds them to that same record, it won’t file a second consultation."
                    : "Could not save this record. Nothing was stored — try again."
              }
              onSubmit={(values) =>
                saveConsultation.mutate(
                  {
                    patientId: patient.id,
                    visit: {
                      departmentId:
                        patient.currentVisit?.departmentId ?? session.departmentId,
                      departmentName:
                        patient.currentVisit?.departmentName ??
                        session.departmentName,
                      startedAt: patient.currentVisit?.since,
                    },
                    ...values,
                  },
                  { onSuccess: () => setConsultationOpen(false) },
                )
              }
            />
          )}
          <VitalsDialog
            open={vitalsOpen}
            onOpenChange={setVitalsOpen}
            isSubmitting={recordVitals.isPending}
            onSubmit={(vitals) =>
              recordVitals.mutate(
                { id: patient.id, vitals },
                { onSuccess: () => setVitalsOpen(false) },
              )
            }
          />
        </>
      )}
    </div>
  );
}
