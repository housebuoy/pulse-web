"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { TIMES } from "@/lib/constants";
import { ROLE_LABEL } from "@/lib/staff-utils";
import type { StaffFormValues, StaffRole } from "@/lib/types/staff";

const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const TIME_OPTIONS = TIMES.map((t) => ({ label: fmt(t), value: t }));

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as StaffRole[]).map((r) => ({
  label: ROLE_LABEL[r],
  value: r,
}));

export function StaffFormDialog({
  open,
  onOpenChange,
  departments,
  initialValues,
  onSubmit,
  isSubmitting,
  title,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string }[];
  initialValues?: Partial<StaffFormValues>;
  onSubmit: (values: StaffFormValues) => void;
  isSubmitting: boolean;
  title: string;
  submitLabel: string;
}) {
  const defaultValues: StaffFormValues = {
    name: "",
    role: "doctor",
    title: "",
    specialty: "",
    departmentId: departments[0]?.id ?? "",
    departmentName: departments[0]?.name ?? "",
    email: "",
    phone: "",
    shiftStart: "08:00",
    shiftEnd: "17:00",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StaffFormValues>({ defaultValues });

  // Re-seed the form every time the dialog opens — covers both "New staff"
  // (no initialValues) and "Edit" (a specific member's current values).
  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, ...initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  // useWatch (not methods.watch()) — the latter returns a fresh function each
  // render, which React Compiler can't memoize safely.
  const role = useWatch({ control, name: "role" });

  const submit = (values: StaffFormValues) => {
    const department = departments.find((d) => d.id === values.departmentId);
    onSubmit({
      ...values,
      name: values.name.trim(),
      title: values.title.trim(),
      email: values.email.trim(),
      departmentName: department?.name ?? values.departmentName,
      specialty:
        role === "doctor" ? values.specialty?.trim() || undefined : undefined,
      phone: values.phone?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Staff details are used across the queue, appointments, and
            department views.
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
                placeholder="e.g. Dr. Owusu"
                {...register("name", { required: "Name is required." })}
              />
            </FormField>

            <FormField label="Role" htmlFor="role">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <SingleSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={ROLE_OPTIONS}
                    placeholder="Select role"
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Title"
              htmlFor="title"
              error={errors.title?.message}
            >
              <Input
                id="title"
                placeholder="e.g. Cardiologist"
                {...register("title", { required: "Title is required." })}
              />
            </FormField>

            {role === "doctor" && (
              <FormField label="Specialty" htmlFor="specialty">
                <Input
                  id="specialty"
                  placeholder="e.g. Interventional Cardiology"
                  {...register("specialty")}
                />
              </FormField>
            )}
          </div>

          <FormField label="Department" htmlFor="departmentId">
            <Controller
              control={control}
              name="departmentId"
              rules={{ required: true }}
              render={({ field }) => (
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={departments.map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                  placeholder="Select department"
                  searchPlaceholder="Search departments…"
                  emptyText="No departments found."
                />
              )}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="name@pulsehealth.test"
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email.",
                  },
                })}
              />
            </FormField>

            <FormField label="Phone (optional)" htmlFor="phone">
              <Input
                id="phone"
                placeholder="+233 24 000 0000"
                {...register("phone")}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Shift start" htmlFor="shiftStart">
              <Controller
                control={control}
                name="shiftStart"
                render={({ field }) => (
                  <SingleSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={TIME_OPTIONS}
                    placeholder="Select time"
                    searchPlaceholder="Search time…"
                    emptyText="No times found."
                  />
                )}
              />
            </FormField>
            <FormField label="Shift end" htmlFor="shiftEnd">
              <Controller
                control={control}
                name="shiftEnd"
                render={({ field }) => (
                  <SingleSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={TIME_OPTIONS}
                    placeholder="Select time"
                    searchPlaceholder="Search time…"
                    emptyText="No times found."
                  />
                )}
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
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
