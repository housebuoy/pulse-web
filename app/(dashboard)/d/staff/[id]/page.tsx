"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Pencil, Phone } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { StaffStatusBadge } from "@/components/dashboard/staff/staff-status-badge";
import { DutyControl } from "@/components/dashboard/staff/duty-control";
import { StaffFormDialog } from "@/components/dashboard/staff/staff-form-dialog";
import { UserAvatar } from "@/components/dashboard/shared/user-avatar";
import { useStaffMember, useUpdateStaff } from "@/hooks/use-staff";
import { useDepartments } from "@/hooks/use-departments";
import { ROLE_LABEL, formatShift } from "@/lib/staff-utils";
import type { DutyStatus } from "@/lib/types/staff";

export default function StaffMemberPage() {
  const { id } = useParams<{ id: string }>();
  const { data: member, isLoading } = useStaffMember(id);
  const { data: departments = [] } = useDepartments();
  const update = useUpdateStaff();
  const [editOpen, setEditOpen] = useState(false);

  const handleDutyChange = (dutyStatus: DutyStatus) => {
    if (!member) return;
    update.mutate({ id: member.id, dutyStatus });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Staff" />

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl space-y-4">
          {member?.departmentId && (
            <Link
              href={`/d/departments?dept=${member.departmentId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              Back to {member.departmentName}
            </Link>
          )}

          <div className="rounded-xl border border-border bg-surface p-6">
            {isLoading && !member ? (
              <p className="text-sm text-fg-muted">Loading…</p>
            ) : !member ? (
              <p className="text-sm text-fg-muted">Staff member not found.</p>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="lg" />
                    <div>
                      <h1 className="text-xl font-bold text-fg">
                        {member.name}
                      </h1>
                      <p className="text-sm text-fg-muted">
                        {member.title}
                        {member.specialty ? ` · ${member.specialty}` : ""}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StaffStatusBadge status={member.dutyStatus} />
                  <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-fg-secondary">
                    {ROLE_LABEL[member.role]}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                    {member.departmentName || "Unassigned"}
                  </span>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-fg-placeholder">
                    Duty status
                  </p>
                  <DutyControl
                    value={member.dutyStatus}
                    onChange={handleDutyChange}
                    disabled={update.isPending}
                  />
                </div>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex items-center gap-2 text-fg-secondary">
                    <Mail className="size-4 text-fg-muted" />
                    {member.email}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-fg-secondary">
                      <Phone className="size-4 text-fg-muted" />
                      {member.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-fg-secondary">
                    <span className="text-fg-muted">Shift</span>
                    {formatShift(member)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {member && (
        <StaffFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
          title="Edit staff member"
          submitLabel="Save changes"
          isSubmitting={update.isPending}
          initialValues={{
            name: member.name,
            role: member.role,
            title: member.title,
            specialty: member.specialty,
            departmentId: member.departmentId,
            departmentName: member.departmentName,
            email: member.email,
            phone: member.phone,
            shiftStart: member.shiftStart,
            shiftEnd: member.shiftEnd,
          }}
          onSubmit={(values) =>
            update.mutate(
              { id: member.id, ...values },
              { onSuccess: () => setEditOpen(false) },
            )
          }
        />
      )}
    </div>
  );
}
