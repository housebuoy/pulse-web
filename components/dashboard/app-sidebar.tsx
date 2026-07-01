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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Stethoscope,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentFacility, useCurrentUser } from "@/hooks/use-dashboard";
import { useFacility, useProfile } from "@/hooks/use-settings";
import { UserAvatar } from "@/components/dashboard/shared/user-avatar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/d/overview", icon: LayoutGrid },
  { label: "Live Queue", href: "/d/live-queue", icon: ListOrdered },
  { label: "Appointments", href: "/d/appointments", icon: CalendarDays },
  { label: "Departments", href: "/d/departments", icon: Building2 },
  { label: "Staff & Doctors", href: "/d/staff", icon: Stethoscope },
  { label: "Patients", href: "/d/patients", icon: Users },
  { label: "Analytics", href: "/d/analytics", icon: BarChart3 },
  { label: "Settings", href: "/d/settings", icon: Settings },
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
  // avatarUrl and logoUrl come from settings (single source of truth).
  const { data: profile } = useProfile();
  const { data: facilitySettings } = useFacility();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col justify-between border-r border-border bg-surface p-4 transition-[width] duration-200 print:hidden",
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
              facilitySettings?.logoUrl && "bg-transparent p-0 overflow-hidden",
              collapsed && "cursor-pointer",
            )}
          >
            {facilitySettings?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={facilitySettings.logoUrl}
                alt={facility?.name ?? "Facility logo"}
                className="size-9 rounded-[10px] object-cover"
              />
            ) : (
              <Activity
                className={cn(
                  "size-5 text-white transition-opacity",
                  collapsed && "group-hover:opacity-0",
                )}
              />
            )}
            {collapsed && !facilitySettings?.logoUrl && (
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
                {/* <ChevronDown className="size-4 shrink-0 text-fg-muted" /> */}
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

      {/* profile — clicking opens a menu: Profile & Account + Log out */}
      <DropdownMenu>
        <SidebarTooltip active={collapsed} label={user?.name ?? "Loading…"}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-2.5 transition-colors hover:bg-surface-muted",
                collapsed && "justify-center border-0 bg-transparent",
              )}
            >
              <UserAvatar
                name={user?.name ?? "U"}
                avatarUrl={profile?.avatarUrl}
                size="sm"
                shape="square"
                className="bg-brand/15"
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="truncate text-[13px] font-medium text-fg">
                    {user?.name ?? "Loading…"}
                  </span>
                  <span className="text-[11px] text-fg-muted">{user?.role ?? ""}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
        </SidebarTooltip>

        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/d/settings?tab=profile" className="flex items-center gap-2">
              <User className="size-4" />
              Profile &amp; Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("pulse_token");
              }
              window.location.href = "/onboarding/admin";
            }}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}