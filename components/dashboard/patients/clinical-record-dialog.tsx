"use client";

import { useEffect } from "react";
import { Plus, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/onboarding/form-field";
import type { Medication } from "@/lib/types/patients";

interface ClinicalRecordFormValues {
  allergiesText: string; // comma-separated, parsed to allergies[] on submit
  medications: Medication[];
}

// Record-keeping only — this dialog captures allergies/medications as plain
// text the way staff report them. It must never flag, score, or warn (no
// interaction/allergy checks, no dosage suggestions). See lib/types/patients.ts.
export function ClinicalRecordDialog({
  open,
  onOpenChange,
  allergies,
  medications,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allergies: string[];
  medications: Medication[];
  onSubmit: (values: { allergies: string[]; medications: Medication[] }) => void;
  isSubmitting: boolean;
}) {
  const { register, control, handleSubmit, reset } =
    useForm<ClinicalRecordFormValues>({
      defaultValues: { allergiesText: allergies.join(", "), medications },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  useEffect(() => {
    if (open) {
      reset({ allergiesText: allergies.join(", "), medications });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allergies, medications]);

  const submit = (values: ClinicalRecordFormValues) => {
    onSubmit({
      allergies: values.allergiesText
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      medications: values.medications
        .filter((m) => m.name.trim())
        .map((m) => ({
          name: m.name.trim(),
          dose: m.dose.trim(),
          frequency: m.frequency.trim(),
        })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit clinical record</DialogTitle>
          <DialogDescription>
            Captures what&apos;s on file — allergies and medications as
            reported, with no automated checks against each other.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <FormField label="Allergies (comma-separated)" htmlFor="allergiesText">
            <Input
              id="allergiesText"
              placeholder="e.g. Penicillin, Latex"
              {...register("allergiesText")}
            />
          </FormField>

          <div className="space-y-3">
            <span className="text-label text-fg-secondary">
              Current medications
            </span>

            {fields.length === 0 && (
              <p className="text-body-sm text-fg-muted">
                No medications on file.
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-2 rounded-md border border-border p-3"
              >
                <div className="grid flex-1 grid-cols-3 gap-2">
                  <Input
                    placeholder="Name"
                    {...register(`medications.${index}.name`)}
                  />
                  <Input
                    placeholder="Dose"
                    {...register(`medications.${index}.dose`)}
                  />
                  <Input
                    placeholder="Frequency"
                    {...register(`medications.${index}.frequency`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove medication"
                  onClick={() => remove(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ name: "", dose: "", frequency: "" })}
              className="flex items-center gap-2 text-body-sm font-medium text-brand hover:underline"
            >
              <Plus className="h-4 w-4" /> Add medication
            </button>
          </div>

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
