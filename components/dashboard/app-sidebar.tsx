"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  LayoutGrid,
  ListOrdered,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCurrentFacility, useCurrentUser } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/d/overview", icon: LayoutGrid },
  { label: "Live Queue", href: "/live-queue", icon: ListOrdered },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Departments", href: "/departments", icon: Building2 },
  { label: "Staff & Doctors", href: "/staff", icon: Stethoscope },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function SidebarTooltip({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children: ReactElement;
}) {
  if (!active) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: facility } = useCurrentFacility();
  const { data: user } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col justify-between border-r border-border bg-surface p-4 transition-[width] duration-200",
        collapsed ? "w-18" : "w-64",
      )}
    >
      <div className="flex flex-col gap-5">
        {/* logo */}
        <div className={cn("flex items-center gap-2.5 px-1", collapsed && "justify-center")}>
          <button
            type="button"
            onClick={collapsed ? () => setCollapsed(false) : undefined}
            aria-label={collapsed ? "Expand sidebar" : "Pulse Health"}
            className={cn(
              "group relative flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand",
              collapsed && "cursor-pointer",
            )}
          >
            <Activity
              className={cn(
                "size-5 text-white transition-opacity",
                collapsed && "group-hover:opacity-0",
              )}
            />
            {collapsed && (
              <PanelLeftOpen className="absolute size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>

          {!collapsed && (
            <>
              <span className="flex-1 truncate font-wordmark text-lg font-black tracking-tight text-fg">
                Pulse Health
              </span>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
              >
                <PanelLeftClose className="size-4" />
              </button>
            </>
          )}
        </div>

        {/* facility switcher */}
        <SidebarTooltip active={collapsed} label={facility?.name ?? "Loading…"}>
          <button
            className={cn(
              "flex items-center gap-2 rounded-[10px] border border-border bg-surface-subtle p-3 text-left",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <Building2 className="size-4 shrink-0 text-fg-muted" />
            ) : (
              <>
                <div className="flex flex-1 flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-placeholder">
                    Facility
                  </span>
                  <span className="truncate text-[13px] font-medium text-fg-secondary">
                    {facility?.name ?? "Loading…"}
                  </span>
                </div>
                <ChevronDown className="size-4 shrink-0 text-fg-muted" />
              </>
            )}
          </button>
        </SidebarTooltip>

        {/* nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <SidebarTooltip key={href} active={collapsed} label={label}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-fg-secondary hover:bg-surface-subtle",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!collapsed && label}
                </Link>
              </SidebarTooltip>
            );
          })}
        </nav>
      </div>

      {/* profile */}
      <SidebarTooltip active={collapsed} label={user?.name ?? "Loading…"}>
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-2.5",
            collapsed && "justify-center border-0 bg-transparent",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-sm font-bold text-brand">
            {(user?.name ?? "U")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-fg">
                {user?.name ?? "Loading…"}
              </span>
              <span className="text-[11px] text-fg-muted">{user?.role ?? ""}</span>
            </div>
          )}
        </div>
      </SidebarTooltip>
    </aside>
  );
}