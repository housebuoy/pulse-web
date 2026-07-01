"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { SingleSelect } from "@/components/ui/single-select";
import { FormField } from "@/components/onboarding/form-field";
import { GENDER_LABEL } from "@/lib/patient-utils";
import type { Gender, PatientFormValues } from "@/lib/types/patients";

const GENDER_OPTIONS = (Object.keys(GENDER_LABEL) as Gender[]).map((g) => ({
  label: GENDER_LABEL[g],
  value: g,
}));

export function PatientFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  isSubmitting,
  title,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<PatientFormValues>;
  onSubmit: (values: PatientFormValues) => void;
  isSubmitting: boolean;
  title: string;
  submitLabel: string;
}) {
  const defaultValues: PatientFormValues = {
    name: "",
    dateOfBirth: "",
    gender: "female",
    phone: "",
    email: "",
    address: "",
    bloodType: "",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({ defaultValues });

  // Re-seed the form every time the dialog opens — covers both "New patient"
  // (no initialValues) and "Edit" (a specific patient's current values).
  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, ...initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const submit = (values: PatientFormValues) => {
    onSubmit({
      ...values,
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email?.trim() || undefined,
      address: values.address?.trim() || undefined,
      bloodType: values.bloodType?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Demographic and contact details only — clinical record fields are
            edited from the patient&apos;s file.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Full name"
              htmlFor="name"
              error={errors.name?.message}
            >
              <Input
                id="name"
                placeholder="e.g. Kwame Mensah"
                {...register("name", { required: "Name is required." })}
              />
            </FormField>

            <FormField
              label="Date of birth"
              htmlFor="dateOfBirth"
              error={errors.dateOfBirth?.message}
            >
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth", {
                  required: "Date of birth is required.",
                })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gender" htmlFor="gender">
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <SingleSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />
                )}
              />
            </FormField>

            <FormField
              label="Phone"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                placeholder="+233 20 000 0000"
                {...register("phone", { required: "Phone is required." })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email (optional)" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="name@example.test"
                {...register("email")}
              />
            </FormField>

            <FormField label="Blood type (optional)" htmlFor="bloodType">
              <Input
                id="bloodType"
                placeholder="e.g. O+"
                {...register("bloodType")}
              />
            </FormField>
          </div>

          <FormField label="Address (optional)" htmlFor="address">
            <Input
              id="address"
              placeholder="e.g. 12 Ring Road, Accra"
              {...register("address")}
            />
          </FormField>

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
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
