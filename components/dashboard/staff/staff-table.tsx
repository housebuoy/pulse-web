"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { StaffStatusBadge } from "./staff-status-badge";
import { UserAvatar } from "@/components/dashboard/shared/user-avatar";
import { ROLE_LABEL, formatShift } from "@/lib/staff-utils";
import type { StaffMember } from "@/lib/types/staff";

function HeaderRow() {
  return (
    <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
      <div className="col-span-4">Name</div>
      <div className="col-span-2">Role</div>
      <div className="col-span-3">Department</div>
      <div className="col-span-2">Shift</div>
      <div className="col-span-1 text-right">Status</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4">
      <div className="col-span-4 h-4 w-32 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-2 h-4 w-16 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-3 h-4 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-2 h-4 w-20 animate-pulse rounded bg-surface-muted" />
      <div className="col-span-1 ml-auto h-5 w-16 animate-pulse rounded-full bg-surface-muted" />
    </div>
  );
}

export function StaffTable({
  staff,
  isLoading,
}: {
  staff: StaffMember[];
  isLoading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <HeaderRow />

      {isLoading && staff.length === 0 ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <Users className="h-6 w-6 text-fg-muted" />
          </div>
          <div>
            <p className="font-medium text-fg">No staff found</p>
            <p className="text-sm text-fg-muted">
              Nothing matches the current filters.
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {staff.map((member) => (
            <li key={member.id}>
              <Link
                href={`/d/staff/${member.id}`}
                className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-subtle"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-fg">
                      {member.name}
                    </div>
                    <div className="truncate text-xs text-fg-muted">
                      {member.title}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-fg-secondary">
                  {ROLE_LABEL[member.role]}
                </div>
                <div className="col-span-3 truncate text-sm text-fg-secondary">
                  {member.departmentName || "Unassigned"}
                </div>
                <div className="col-span-2 text-sm text-fg-muted">
                  {formatShift(member)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <StaffStatusBadge status={member.dutyStatus} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
