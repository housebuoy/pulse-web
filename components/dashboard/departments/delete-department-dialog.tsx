"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteDepartment,
  useUpdateDepartment,
} from "@/hooks/use-departments";
import { canDelete } from "@/lib/department-utils";
import type { Department } from "@/lib/types/departments";

export function DeleteDepartmentDialog({
  department,
  open,
  onOpenChange,
  onRemoved,
}: {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved: () => void;
}) {
  const deleteDept = useDeleteDepartment();
  const archive = useUpdateDepartment();
  const blocked = !canDelete(department);

  const handleDelete = () => {
    deleteDept.mutate(department.id, {
      onSuccess: () => {
        onOpenChange(false);
        onRemoved();
      },
    });
  };

  const handleArchive = () => {
    archive.mutate(
      { id: department.id, status: "archived" },
      {
        onSuccess: () => {
          onOpenChange(false);
          onRemoved();
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? "Can't delete yet" : `Delete ${department.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `${department.name} still has people on the floor today (waiting, in consultation, or appointments booked). Archive it instead — it'll disappear from the active list but its history is kept.`
              : "This permanently removes the department. This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {blocked ? (
            <AlertDialogAction
              onClick={handleArchive}
              disabled={archive.isPending}
            >
              {archive.isPending ? "Archiving…" : "Archive instead"}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDept.isPending}
            >
              {deleteDept.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
