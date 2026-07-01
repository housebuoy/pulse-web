"use client";

import { useState } from "react";
import { Clock, MoreHorizontal, Trash2, UserCog, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssignHeadDoctorDialog } from "./assign-head-doctor-dialog";
import { ManageStaffDialog } from "./manage-staff-dialog";
import { AdjustHoursDialog } from "./adjust-hours-dialog";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import type { Department } from "@/lib/types/departments";

type DialogKey = "assign" | "staff" | "hours" | "delete" | null;

export function DepartmentActionsMenu({
  department,
  onRemoved,
}: {
  department: Department;
  onRemoved: () => void;
}) {
  const [openDialog, setOpenDialog] = useState<DialogKey>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="outline" aria-label="More actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpenDialog("assign")}>
            <UserCog className="size-4" />
            Assign head doctor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("staff")}>
            <Users className="size-4" />
            Manage staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("hours")}>
            <Clock className="size-4" />
            Adjust hours
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignHeadDoctorDialog
        department={department}
        open={openDialog === "assign"}
        onOpenChange={(open) => setOpenDialog(open ? "assign" : null)}
      />
      <ManageStaffDialog
        department={department}
        open={openDialog === "staff"}
        onOpenChange={(open) => setOpenDialog(open ? "staff" : null)}
      />
      <AdjustHoursDialog
        department={department}
        open={openDialog === "hours"}
        onOpenChange={(open) => setOpenDialog(open ? "hours" : null)}
      />
      <DeleteDepartmentDialog
        department={department}
        open={openDialog === "delete"}
        onOpenChange={(open) => setOpenDialog(open ? "delete" : null)}
        onRemoved={onRemoved}
      />
    </>
  );
}
