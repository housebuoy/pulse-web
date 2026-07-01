"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DepartmentForm } from "./department-form";
import { useCreateDepartment } from "@/hooks/use-departments";
import type { DepartmentFormValues } from "@/lib/types/departments";

export function DepartmentFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateDepartment();

  const handleSubmit = (values: DepartmentFormValues) => {
    create.mutate(values, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New department</DialogTitle>
        </DialogHeader>
        <DepartmentForm
          isSubmitting={create.isPending}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
