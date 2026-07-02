"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";
import {
  Activity,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/dashboard/shared/user-avatar";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AppSidebarProps {
  /** Short uppercase label above the context value, e.g. "FACILITY" */
  contextLabel: string;
  /** The value shown in the context chip, e.g. facility name or dept name */
  contextValue: string;
  /** Icon shown in the chip when the sidebar is collapsed (default: Building2) */
  contextCollapsedIcon?: LucideIcon;
  navItems: NavItem[];
  /** Optional facility/workspace logo — replaces the Activity icon */
  logoUrl?: string;
  logoAlt?: string;
  user: {
    name: string;
    subtitle: string;
    avatarUrl?: string;
  };
  /** DropdownMenuItems rendered inside the user-card dropdown */
  userMenuContent: ReactNode;
}

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

export function AppShellSidebar({
  contextLabel,
  contextValue,
  contextCollapsedIcon: ContextIcon = Building2,
  navItems,
  logoUrl,
  logoAlt,
  user,
  userMenuContent,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col justify-between border-r border-border bg-surface p-4 transition-[width] duration-200 print:hidden",
        collapsed ? "w-18" : "w-64",
      )}
    >
      <div className="flex flex-col gap-5">
        {/* logo + collapse toggle */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-1",
            collapsed && "justify-center",
          )}
        >
          <button
            type="button"
            onClick={collapsed ? () => setCollapsed(false) : undefined}
            aria-label={collapsed ? "Expand sidebar" : "Pulse Health"}
            className={cn(
              "group relative flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand",
              logoUrl && "overflow-hidden bg-transparent p-0",
              collapsed && "cursor-pointer",
            )}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={logoAlt ?? "Logo"}
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
            {collapsed && !logoUrl && (
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

        {/* context chip */}
        <SidebarTooltip active={collapsed} label={contextValue}>
          <div
            className={cn(
              "flex items-center gap-2 rounded-[10px] border border-border bg-surface-subtle p-3",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <ContextIcon className="size-4 shrink-0 text-fg-muted" />
            ) : (
              <div className="flex flex-1 flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fg-placeholder">
                  {contextLabel}
                </span>
                <span className="truncate text-[13px] font-medium text-fg-secondary">
                  {contextValue}
                </span>
              </div>
            )}
          </div>
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
                  <Icon className="size-4.5 shrink-0" />
                  {!collapsed && label}
                </Link>
              </SidebarTooltip>
            );
          })}
        </nav>
      </div>

      {/* user card — opens a dropdown */}
      <DropdownMenu>
        <SidebarTooltip active={collapsed} label={user.name}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-2.5 transition-colors hover:bg-surface-muted",
                collapsed && "justify-center border-0 bg-transparent",
              )}
            >
              <UserAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                size="sm"
                shape="square"
                className="bg-brand/15"
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="truncate text-[13px] font-medium text-fg">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-fg-muted">{user.subtitle}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
        </SidebarTooltip>

        <DropdownMenuContent side="top" align="start" className="w-56">
          {userMenuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
