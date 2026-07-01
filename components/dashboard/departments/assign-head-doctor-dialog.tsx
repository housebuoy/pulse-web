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
import { useStaff } from "@/hooks/use-staff";
import { useAssignHeadDoctor } from "@/hooks/use-departments";
import type { Department } from "@/lib/types/departments";

export function AssignHeadDoctorDialog({
  department,
  open,
  onOpenChange,
}: {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: staff = [] } = useStaff();
  const doctors = staff.filter(
    (s) => s.role === "doctor" && s.departmentId === department.id,
  );
  const [selected, setSelected] = useState(department.headDoctorName);
  const assign = useAssignHeadDoctor();

  const handleSave = () => {
    assign.mutate(
      { id: department.id, headDoctorName: selected },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign head doctor</DialogTitle>
          <DialogDescription>
            Choose from doctors already on staff in {department.name}.
          </DialogDescription>
        </DialogHeader>

        {doctors.length === 0 ? (
          <p className="text-sm text-fg-muted">
            No doctors assigned to this department yet. Use{" "}
            <span className="font-medium text-fg">Manage staff</span> to add
            one first.
          </p>
        ) : (
          <SingleSelect
            value={selected}
            onChange={setSelected}
            options={doctors.map((d) => ({ label: d.name, value: d.name }))}
            placeholder="Select a doctor"
            searchPlaceholder="Search doctors…"
            emptyText="No doctors found."
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={assign.isPending || doctors.length === 0 || !selected}
          >
            {assign.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
