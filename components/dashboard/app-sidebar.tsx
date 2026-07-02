"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  CalendarDays,
  LayoutGrid,
  ListOrdered,
  LogOut,
  Settings,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrentFacility, useCurrentUser } from "@/hooks/use-dashboard";
import { useFacility, useProfile } from "@/hooks/use-settings";
import { AppShellSidebar } from "@/components/shell/app-sidebar";

const navItems = [
  { label: "Overview", href: "/d/overview", icon: LayoutGrid },
  { label: "Live Queue", href: "/d/live-queue", icon: ListOrdered },
  { label: "Appointments", href: "/d/appointments", icon: CalendarDays },
  { label: "Departments", href: "/d/departments", icon: Building2 },
  { label: "Staff & Doctors", href: "/d/staff", icon: Stethoscope },
  { label: "Patients", href: "/d/patients", icon: Users },
  { label: "Analytics", href: "/d/analytics", icon: BarChart3 },
  { label: "Settings", href: "/d/settings", icon: Settings },
];

export function AppSidebar() {
  const { data: facility } = useCurrentFacility();
  const { data: user } = useCurrentUser();
  const { data: profile } = useProfile();
  const { data: facilitySettings } = useFacility();

  return (
    <AppShellSidebar
      contextLabel="Facility"
      contextValue={facility?.name ?? "Loading…"}
      navItems={navItems}
      logoUrl={facilitySettings?.logoUrl}
      logoAlt={facility?.name}
      user={{
        name: user?.name ?? "Loading…",
        subtitle: user?.role ?? "",
        avatarUrl: profile?.avatarUrl,
      }}
      userMenuContent={
        <>
          <DropdownMenuItem asChild>
            <Link
              href="/d/profile"
              className="flex items-center gap-2"
            >
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
        </>
      }
    />
  );
}
