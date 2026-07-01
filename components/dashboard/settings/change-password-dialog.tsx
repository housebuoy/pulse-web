"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/onboarding/form-field";
import { useChangePassword } from "@/hooks/use-settings";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultValues: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const changePassword = useChangePassword();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ defaultValues });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, reset]);

  const submit = (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) return;
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  // useWatch (not methods.watch()) — the latter returns a fresh function each
  // render, which React Compiler can't memoize safely.
  const newPassword = useWatch({ control, name: "newPassword" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            You&apos;ll use this password the next time you sign in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <FormField
            label="Current password"
            htmlFor="currentPassword"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="currentPassword"
              {...register("currentPassword", { required: "Required." })}
            />
          </FormField>

          <FormField
            label="New password"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
          >
            <PasswordInput
              id="newPassword"
              {...register("newPassword", {
                required: "Required.",
                minLength: { value: 8, message: "At least 8 characters." },
              })}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Required.",
                validate: (v) => v === newPassword || "Passwords do not match.",
              })}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={changePassword.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Saving…" : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
