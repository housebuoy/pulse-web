"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import type { Vitals } from "@/lib/types/patients";

type VitalsFormValues = Omit<Vitals, "recordedAt">;

// Record-keeping only — captures readings exactly as entered. No range
// checking, no abnormal-value flagging. See lib/types/patients.ts.
export function VitalsDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vitals: VitalsFormValues) => void;
  isSubmitting: boolean;
}) {
  const defaultValues: VitalsFormValues = {
    bloodPressure: "",
    temperature: "",
    pulse: "",
    weight: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VitalsFormValues>({ defaultValues });

  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (values: VitalsFormValues) => {
    onSubmit({
      bloodPressure: values.bloodPressure.trim(),
      temperature: values.temperature.trim(),
      pulse: values.pulse.trim(),
      weight: values.weight.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record vitals</DialogTitle>
          <DialogDescription>
            Logs a new reading with the current time. Replaces what shows as
            &ldquo;latest&rdquo; — earlier readings aren&apos;t kept on this
            view.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Blood pressure"
              htmlFor="bloodPressure"
              error={errors.bloodPressure?.message}
            >
              <Input
                id="bloodPressure"
                placeholder="e.g. 120/80"
                {...register("bloodPressure", { required: "Required." })}
              />
            </FormField>
            <FormField
              label="Temperature"
              htmlFor="temperature"
              error={errors.temperature?.message}
            >
              <Input
                id="temperature"
                placeholder="e.g. 37.0°C"
                {...register("temperature", { required: "Required." })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Pulse"
              htmlFor="pulse"
              error={errors.pulse?.message}
            >
              <Input
                id="pulse"
                placeholder="e.g. 72 bpm"
                {...register("pulse", { required: "Required." })}
              />
            </FormField>
            <FormField
              label="Weight"
              htmlFor="weight"
              error={errors.weight?.message}
            >
              <Input
                id="weight"
                placeholder="e.g. 68 kg"
                {...register("weight", { required: "Required." })}
              />
            </FormField>
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
              {isSubmitting ? "Saving…" : "Save vitals"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
