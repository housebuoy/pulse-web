"use client";

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/staff-utils";
import { usePermissionMatrix, useUpdatePermission } from "@/hooks/use-settings";
import type { PermissionLevel } from "@/lib/types/settings";
import type { StaffRole } from "@/lib/types/staff";

const ROLES: StaffRole[] = ["admin", "doctor", "nurse", "front-desk", "read-only"];

const LEVEL_CYCLE: PermissionLevel[] = ["none", "view", "edit"];

const LEVEL_STYLE: Record<PermissionLevel, string> = {
  none: "bg-surface-muted text-fg-placeholder",
  view: "bg-warning/10 text-warning",
  edit: "bg-success/10 text-success",
};

const LEVEL_LABEL: Record<PermissionLevel, string> = {
  none: "None",
  view: "View",
  edit: "Edit",
};

// View + edit of permission DATA only — nothing here gates routes or
// requests. See module note in lib/types/settings.ts.
export function PermissionMatrix() {
  const { data: rows = [], isLoading } = usePermissionMatrix();
  const update = useUpdatePermission();

  const cycle = (resource: string, role: StaffRole, current: PermissionLevel) => {
    const next =
      LEVEL_CYCLE[(LEVEL_CYCLE.indexOf(current) + 1) % LEVEL_CYCLE.length];
    update.mutate({ resource, role, level: next });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-1 text-base font-bold text-fg">Roles &amp; permissions</h2>
      <p className="mb-4 text-sm text-fg-muted">
        Click a cell to cycle None → View → Edit. Records intent only.
      </p>

      <div className="mb-5 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          This matrix is not enforced by the app — it&apos;s a record of
          intended access. Applies once backend RBAC is live.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
                <th className="py-2 pr-4">Resource</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-2 py-2 text-center">
                    {ROLE_LABEL[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.resource}>
                  <td className="py-2.5 pr-4 font-medium text-fg">
                    {row.resource}
                  </td>
                  {ROLES.map((role) => {
                    const level = row.permissions[role];
                    return (
                      <td key={role} className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => cycle(row.resource, role, level)}
                          disabled={update.isPending}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50",
                            LEVEL_STYLE[level],
                          )}
                        >
                          {LEVEL_LABEL[level]}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
