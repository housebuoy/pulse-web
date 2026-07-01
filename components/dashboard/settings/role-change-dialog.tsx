"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SingleSelect } from "@/components/ui/single-select";
import { useUpdateStaff } from "@/hooks/use-staff";
import { ROLE_LABEL } from "@/lib/staff-utils";
import type { StaffMember, StaffRole } from "@/lib/types/staff";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as StaffRole[]).map((r) => ({
  label: ROLE_LABEL[r],
  value: r,
}));

export function RoleChangeDialog({
  member,
  open,
  onOpenChange,
}: {
  member: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [role, setRole] = useState<StaffRole>(member.role);
  const update = useUpdateStaff();

  const handleSave = () => {
    update.mutate(
      { id: member.id, role },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Updates {member.name}&apos;s access role. Doesn&apos;t change their
            clinical title or department.
          </DialogDescription>
        </DialogHeader>

        <SingleSelect
          value={role}
          onChange={(v) => setRole(v as StaffRole)}
          options={ROLE_OPTIONS}
          placeholder="Select role"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending || role === member.role}
          >
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
