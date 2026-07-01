"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepartmentForm } from "@/components/dashboard/departments/department-form";
import { useDepartment, useUpdateDepartment } from "@/hooks/use-departments";

export default function EditDepartmentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: department, isLoading } = useDepartment(id);
  const update = useUpdateDepartment();

  const goBack = () => router.push(`/d/departments?dept=${id}`);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Edit Department" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <div className="rounded-xl border border-border bg-surface p-6">
            {isLoading && !department ? (
              <p className="text-sm text-fg-muted">Loading…</p>
            ) : !department ? (
              <p className="text-sm text-fg-muted">Department not found.</p>
            ) : (
              <DepartmentForm
                initialValues={department}
                isSubmitting={update.isPending}
                submitLabel="Save changes"
                pendingLabel="Saving…"
                onCancel={goBack}
                onSubmit={(values) =>
                  update.mutate(
                    { id, ...values },
                    { onSuccess: goBack },
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
