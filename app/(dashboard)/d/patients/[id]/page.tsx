"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ListOrdered,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PatientVisitBadge } from "@/components/dashboard/patients/patient-visit-badge";
import { PatientFormDialog } from "@/components/dashboard/patients/patient-form-dialog";
import { ClinicalRecordDialog } from "@/components/dashboard/patients/clinical-record-dialog";
import { VitalsDialog } from "@/components/dashboard/patients/vitals-dialog";
import {
  usePatient,
  useRecordVitals,
  useUpdateClinicalRecord,
  useUpdatePatient,
} from "@/hooks/use-patients";
import {
  GENDER_LABEL,
  VISIT_STATUS_LABEL,
  calculateAge,
  initials,
} from "@/lib/patient-utils";
import { formatJoined, formatShortDate, formatTime } from "@/lib/format";

export default function PatientFilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading } = usePatient(id);
  const updatePatient = useUpdatePatient();
  const updateClinicalRecord = useUpdateClinicalRecord();
  const recordVitals = useRecordVitals();

  const [editOpen, setEditOpen] = useState(false);
  const [clinicalOpen, setClinicalOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Patients" />

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {isLoading && !patient ? (
            <p className="text-sm text-fg-muted">Loading…</p>
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
                    <h1 className="text-xl font-bold text-fg">
                      {patient.name}
                    </h1>
                    <p className="text-sm text-fg-muted">
                      {patient.patientNumber} · {calculateAge(patient.dateOfBirth)}{" "}
                      yrs · {GENDER_LABEL[patient.gender]}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </div>

              {/* status + quick links */}
              <div className="flex flex-wrap items-center gap-2">
                <PatientVisitBadge patient={patient} />
                {patient.currentVisit && (
                  <>
                    <Link
                      href={`/d/live-queue?department=${patient.currentVisit.departmentId}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-subtle"
                    >
                      View in live queue
                      <ArrowRight className="size-3" />
                    </Link>
                    {patient.currentVisit.appointmentId && (
                      <Link
                        href={`/d/appointments?department=${patient.currentVisit.departmentId}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-subtle"
                      >
                        View appointment
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* demographics + contact */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-3 text-base font-bold text-fg">
                  Demographics & contact
                </h2>
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
                    <span className="text-fg-secondary">
                      {patient.dateOfBirth}
                    </span>
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
                  <h2 className="text-base font-bold text-fg">
                    Clinical record
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setVitalsOpen(true)}
                    >
                      <Plus className="size-4" />
                      Record vitals
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setClinicalOpen(true)}
                    >
                      <Pencil className="size-4" />
                      Edit record
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                      Blood type
                    </p>
                    <p className="text-fg-secondary">
                      {patient.bloodType || "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                      Latest vitals
                    </p>
                    {patient.latestVitals ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <div className="font-bold text-fg">
                            {patient.latestVitals.bloodPressure}
                          </div>
                          <div className="text-xs text-fg-muted">
                            Blood pressure
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-fg">
                            {patient.latestVitals.temperature}
                          </div>
                          <div className="text-xs text-fg-muted">
                            Temperature
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-fg">
                            {patient.latestVitals.pulse}
                          </div>
                          <div className="text-xs text-fg-muted">Pulse</div>
                        </div>
                        <div>
                          <div className="font-bold text-fg">
                            {patient.latestVitals.weight}
                          </div>
                          <div className="text-xs text-fg-muted">Weight</div>
                        </div>
                        <p className="col-span-2 sm:col-span-4 text-xs text-fg-muted">
                          Recorded{" "}
                          {formatJoined(patient.latestVitals.recordedAt)}
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
                      <p className="text-fg-muted">No allergies on file.</p>
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
                      <p className="text-fg-muted">No medications on file.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {patient.currentMedications.map((m, i) => (
                          <li
                            key={`${m.name}-${i}`}
                            className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2"
                          >
                            <span className="font-medium text-fg">
                              {m.name}
                            </span>
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

              {/* visit history */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-bold text-fg">
                    Visit history
                  </h2>
                  <Link
                    href="/d/appointments"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    <CalendarDays className="size-4" />
                    View in Appointments
                  </Link>
                </div>

                {patient.currentVisit ? (
                  <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <ListOrdered className="size-4 text-fg-muted" />
                      <span className="text-fg">
                        {VISIT_STATUS_LABEL[patient.currentVisit.status]} ·{" "}
                        <Link
                          href={`/d/departments?dept=${patient.currentVisit.departmentId}`}
                          className="font-medium text-brand hover:underline"
                        >
                          {patient.currentVisit.departmentName}
                        </Link>
                      </span>
                    </div>
                    <span className="text-fg-muted">
                      Since {formatTime(patient.currentVisit.since)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-fg-muted">
                    No visits recorded yet.
                  </p>
                )}
              </div>
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
            initialValues={{
              name: patient.name,
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender,
              phone: patient.phone,
              email: patient.email,
              address: patient.address,
              bloodType: patient.bloodType,
            }}
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
