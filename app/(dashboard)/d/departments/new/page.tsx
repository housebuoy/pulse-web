"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepartmentForm } from "@/components/dashboard/departments/department-form";
import { useCreateDepartment } from "@/hooks/use-departments";

export default function NewDepartmentPage() {
  const router = useRouter();
  const create = useCreateDepartment();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="New Department" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <DepartmentForm
              isSubmitting={create.isPending}
              onCancel={() => router.push("/d/departments")}
              onSubmit={(input) =>
                create.mutate(input, {
                  onSuccess: () => router.push("/d/departments"),
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
