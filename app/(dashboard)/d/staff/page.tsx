"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StaffToolbar } from "@/components/dashboard/staff/staff-toolbar";
import { StaffTable } from "@/components/dashboard/staff/staff-table";
import { StaffFormDialog } from "@/components/dashboard/staff/staff-form-dialog";
import { useCreateStaff, useStaff } from "@/hooks/use-staff";
import { useDepartments } from "@/hooks/use-departments";
import { matchesSearch } from "@/lib/staff-utils";
import type { StaffRole } from "@/lib/types/staff";

type RoleFilter = StaffRole | "all";

function StaffDirectoryBody() {
  // Global header search writes ?q= — read it here instead of a local input
  // so other list pages can share the same param.
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [departmentId, setDepartmentId] = useState("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: staff = [], isLoading } = useStaff();
  const { data: allDepartments = [] } = useDepartments();
  const create = useCreateStaff();

  const departments = useMemo(
    () => allDepartments.filter((d) => d.status !== "archived"),
    [allDepartments],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: staff.length };
    for (const d of departments) {
      result[d.id] = staff.filter((s) => s.departmentId === d.id).length;
    }
    return result;
  }, [staff, departments]);

  const visible = useMemo(
    () =>
      staff.filter(
        (s) =>
          (departmentId === "all" || s.departmentId === departmentId) &&
          (role === "all" || s.role === role) &&
          matchesSearch(s, query),
      ),
    [staff, departmentId, role, query],
  );

  const departmentOptions = departments.map((d) => ({ id: d.id, name: d.name }));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        <StaffToolbar
          departments={departmentOptions}
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          role={role}
          onRoleChange={setRole}
          counts={counts}
          onAddStaff={() => setDialogOpen(true)}
        />

        <StaffTable staff={visible} isLoading={isLoading} />
      </div>

      <StaffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departmentOptions}
        title="New staff member"
        submitLabel="Add staff"
        isSubmitting={create.isPending}
        onSubmit={(values) =>
          create.mutate(values, { onSuccess: () => setDialogOpen(false) })
        }
      />
    </div>
  );
}

export default function StaffDirectoryPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Staff & Doctors" />
      <Suspense fallback={<div className="min-h-0 flex-1" />}>
        <StaffDirectoryBody />
      </Suspense>
    </div>
  );
}
