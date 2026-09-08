"use client";

// Authoring form for a consultation / visit record. Doctor-only.
//
// SCOPE CONSTRAINT: every field here is a plain input the doctor fills. The
// app suggests nothing — no diagnosis picker or lookup, no coded term list,
// no auto-written summary, no advice on the plan. "Structured" means these
// sections organize what the doctor types; it does not mean the app
// contributes clinical judgement. See lib/types/records.ts.

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/onboarding/form-field";
import {
  EMPTY_PRESCRIPTION,
  PrescriptionFields,
} from "@/components/workspace/records/prescription-fields";
import type { PrescriptionDraft } from "@/lib/types/records";

export interface ConsultationFormValues {
  presentingComplaint: string;
  examination: string;
  diagnosis: string;
  plan: string;
  summary: string;
  /** Written during this visit, attached to the record on save. */
  prescriptions: PrescriptionDraft[];
}

const EMPTY: ConsultationFormValues = {
  presentingComplaint: "",
  examination: "",
  diagnosis: "",
  plan: "",
  summary: "",
  prescriptions: [],
};

export function ConsultationRecordDialog({
  open,
  onOpenChange,
  patientName,
  contextLabel,
  onSubmit,
  isSubmitting,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  /** e.g. "Cardiology · since 9:10 AM", or a note that no visit is open. */
  contextLabel: string;
  onSubmit: (values: ConsultationFormValues) => void;
  isSubmitting: boolean;
  error?: string;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationFormValues>({ defaultValues: EMPTY });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  });

  useEffect(() => {
    if (open) reset(EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (values: ConsultationFormValues) =>
    onSubmit({
      presentingComplaint: values.presentingComplaint.trim(),
      examination: values.examination.trim(),
      diagnosis: values.diagnosis.trim(),
      plan: values.plan.trim(),
      summary: values.summary.trim(),
      // A row the doctor added but left blank is dropped rather than saved as
      // an empty prescription. Everything else goes through verbatim.
      prescriptions: values.prescriptions
        .filter((p) => p.medication.trim())
        .map((p) => ({
          medication: p.medication.trim(),
          dose: p.dose.trim(),
          frequency: p.frequency.trim(),
          duration: p.duration.trim(),
          instructions: p.instructions?.trim() || undefined,
        })),
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record consultation</DialogTitle>
          <DialogDescription>
            {patientName} · {contextLabel}. Saved exactly as written, stamped
            with your name and the time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <FormField
            label="Presenting complaint / reason for visit"
            htmlFor="presentingComplaint"
            error={errors.presentingComplaint?.message}
          >
            <Textarea
              id="presentingComplaint"
              rows={3}
              {...register("presentingComplaint", {
                required: "Required.",
              })}
            />
          </FormField>

          <FormField label="Examination / observations" htmlFor="examination">
            <Textarea id="examination" rows={4} {...register("examination")} />
          </FormField>

          <FormField label="Diagnosis" htmlFor="diagnosis">
            {/* Free text, deliberately. Not a select, not a lookup — the app
                must never propose a diagnosis. */}
            <Textarea id="diagnosis" rows={2} {...register("diagnosis")} />
          </FormField>

          <FormField label="Plan / notes" htmlFor="plan">
            <Textarea id="plan" rows={4} {...register("plan")} />
          </FormField>

          <FormField label="Visit summary" htmlFor="summary">
            <Textarea id="summary" rows={3} {...register("summary")} />
          </FormField>

          <PrescriptionFields
            fields={fields}
            register={register}
            onAppend={() => append(EMPTY_PRESCRIPTION)}
            onRemove={remove}
          />

          {error && <p className="text-caption text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
