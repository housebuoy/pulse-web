"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStaff, useUpdateStaff } from "@/hooks/use-staff";
import type { Department } from "@/lib/types/departments";

export function ManageStaffDialog({
  department,
  open,
  onOpenChange,
}: {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: staff = [] } = useStaff();
  const update = useUpdateStaff();

  const inDept = staff.filter((s) => s.departmentId === department.id);
  const others = staff.filter((s) => s.departmentId !== department.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage staff</DialogTitle>
          <DialogDescription>
            Add or remove people from {department.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-4 overflow-y-auto">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
              In this department ({inDept.length})
            </p>
            {inDept.length === 0 ? (
              <p className="text-sm text-fg-muted">No one assigned yet.</p>
            ) : (
              <ul className="space-y-1">
                {inDept.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {member.title}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: member.id,
                          departmentId: "",
                          departmentName: "",
                        })
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
              Other staff
            </p>
            {others.length === 0 ? (
              <p className="text-sm text-fg-muted">No other staff to add.</p>
            ) : (
              <ul className="space-y-1">
                {others.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {member.title}
                        {member.departmentName
                          ? ` · ${member.departmentName}`
                          : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: member.id,
                          departmentId: department.id,
                          departmentName: department.name,
                        })
                      }
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
