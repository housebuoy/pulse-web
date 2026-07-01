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
import { useCreateInvite } from "@/hooks/use-settings";
import { ROLE_LABEL } from "@/lib/staff-utils";
import type { CreateInviteInput } from "@/lib/types/settings";
import type { StaffRole } from "@/lib/types/staff";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as StaffRole[]).map((r) => ({
  label: ROLE_LABEL[r],
  value: r,
}));

const defaultValues: CreateInviteInput = { email: "", role: "nurse" };

export function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateInvite();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInviteInput>({ defaultValues });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, reset]);

  const submit = (values: CreateInviteInput) => {
    create.mutate(values, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>
            Adds a pending invite. They&apos;ll show up here until they
            accept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <FormField
            label="Email"
            htmlFor="invite-email"
            error={errors.email?.message}
          >
            <Input
              id="invite-email"
              type="email"
              placeholder="name@facility.com"
              {...register("email", {
                required: "Required.",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email.",
                },
              })}
            />
          </FormField>

          <FormField label="Role" htmlFor="invite-role">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
