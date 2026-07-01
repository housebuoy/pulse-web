"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UserAvatar } from "@/components/dashboard/shared/user-avatar";
import { InviteUserDialog } from "./invite-user-dialog";
import { RoleChangeDialog } from "./role-change-dialog";
import { PermissionMatrix } from "./permission-matrix";
import { useStaff, useUpdateStaff } from "@/hooks/use-staff";
import { useCancelInvite, useInvites } from "@/hooks/use-settings";
import {
  ACCOUNT_STATUS_META,
  ROLE_LABEL,
  accountStatusOf,
} from "@/lib/staff-utils";
import { formatShortDate } from "@/lib/format";
import type { StaffMember } from "@/lib/types/staff";

export function TeamAccessSection() {
  const { data: staff = [], isLoading } = useStaff();
  const { data: invites = [] } = useInvites();
  const updateStaff = useUpdateStaff();
  const cancelInvite = useCancelInvite();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<StaffMember | null>(null);

  const toggleAccountStatus = (member: StaffMember) => {
    const next = accountStatusOf(member) === "active" ? "deactivated" : "active";
    updateStaff.mutate({ id: member.id, accountStatus: next });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-fg">Users</h2>
          <p className="text-sm text-fg-muted">
            Staff are the users — manage roles and access here.
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Plus className="size-4" />
          Invite user
        </Button>
      </div>

      {invites.length > 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-bold text-fg">Pending invites</h3>
          </div>
          <ul className="divide-y divide-border">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-fg">{invite.email}</p>
                  <p className="text-xs text-fg-muted">
                    Invited as {ROLE_LABEL[invite.role]} ·{" "}
                    {formatShortDate(invite.invitedAt)}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Cancel invite"
                  onClick={() => cancelInvite.mutate(invite.id)}
                  disabled={cancelInvite.isPending}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-3">Department</div>
          <div className="col-span-2">Account</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {isLoading && staff.length === 0 ? (
          <div className="space-y-px p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {staff.map((member) => {
              const status = accountStatusOf(member);
              return (
                <li
                  key={member.id}
                  className="grid grid-cols-12 items-center gap-4 px-5 py-3"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-fg">
                        {member.name}
                      </div>
                      <div className="truncate text-xs text-fg-muted">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-fg-secondary">
                    {ROLE_LABEL[member.role]}
                  </div>
                  <div className="col-span-3 truncate text-sm text-fg-secondary">
                    {member.departmentName || "Unassigned"}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge
                      tone={ACCOUNT_STATUS_META[status].tone}
                      label={ACCOUNT_STATUS_META[status].label}
                      dot
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setRoleTarget(member)}>
                          Change role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant={status === "active" ? "destructive" : "default"}
                          onClick={() => toggleAccountStatus(member)}
                        >
                          {status === "active" ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PermissionMatrix />

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      {roleTarget && (
        <RoleChangeDialog
          member={roleTarget}
          open={!!roleTarget}
          onOpenChange={(open) => !open && setRoleTarget(null)}
        />
      )}
    </div>
  );
}
