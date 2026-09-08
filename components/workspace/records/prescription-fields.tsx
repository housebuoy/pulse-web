"use client";

// Prescription rows inside the consultation form. Any number per visit.
//
// SCOPE CONSTRAINT (the important part of this file): every input here is a
// plain text box. There is deliberately NO medication autocomplete or catalog
// lookup, NO interaction checking, NO cross-reference against the patient's
// recorded allergies, and NO validation of dose/frequency/duration against
// any clinical norm. The doctor decides; the app records what they typed.
// See lib/types/records.ts.

import { Plus, X } from "lucide-react";
import type { UseFormRegister, FieldArrayWithId } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ConsultationFormValues } from "@/components/workspace/records/consultation-record-dialog";

export const EMPTY_PRESCRIPTION = {
  medication: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export function PrescriptionFields({
  fields,
  register,
  onAppend,
  onRemove,
}: {
  fields: FieldArrayWithId<ConsultationFormValues, "prescriptions", "id">[];
  register: UseFormRegister<ConsultationFormValues>;
  onAppend: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <span className="text-label text-fg-secondary">Prescriptions</span>
        <p className="text-caption text-fg-muted">
          Recorded as written. Nothing is checked or suggested.
        </p>
      </div>

      {fields.length === 0 && (
        <p className="text-body-sm text-fg-muted">
          None written for this visit.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-start gap-2">
            <Input
              aria-label={`Medication ${index + 1}`}
              placeholder="Medication"
              className="flex-1"
              {...register(`prescriptions.${index}.medication`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove prescription ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              aria-label={`Dose ${index + 1}`}
              placeholder="Dose"
              {...register(`prescriptions.${index}.dose`)}
            />
            <Input
              aria-label={`Frequency ${index + 1}`}
              placeholder="Frequency"
              {...register(`prescriptions.${index}.frequency`)}
            />
            <Input
              aria-label={`Duration ${index + 1}`}
              placeholder="Duration"
              {...register(`prescriptions.${index}.duration`)}
            />
          </div>

          <Textarea
            aria-label={`Instructions ${index + 1}`}
            rows={2}
            placeholder="Instructions (optional)"
            {...register(`prescriptions.${index}.instructions`)}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onAppend}
        className="flex items-center gap-2 text-body-sm font-medium text-brand hover:underline"
      >
        <Plus className="h-4 w-4" /> Add prescription
      </button>
    </div>
  );
}
