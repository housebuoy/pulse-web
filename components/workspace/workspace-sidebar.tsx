"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ListOrdered,
  LogOut,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { AppShellSidebar } from "@/components/shell/app-sidebar";
import { clearSession } from "@/lib/mock/auth";

const NAV = [
  { label: "My Queue", href: "/w/queue", icon: ListOrdered },
  { label: "My Patients", href: "/w/patients", icon: Users },
  { label: "My Appointments", href: "/w/appointments", icon: CalendarDays },
  { label: "Profile", href: "/w/profile", icon: User },
];

export function WorkspaceSidebar() {
  const session = useWorkspaceSession();
  const router = useRouter();

  return (
    <AppShellSidebar
      contextLabel="Doctor Workspace"
      contextValue={session.departmentName}
      contextCollapsedIcon={Stethoscope}
      navItems={NAV}
      user={{
        name: session.name,
        subtitle: session.title,
        avatarUrl: session.avatarUrl,
      }}
      userMenuContent={
        <>
          <DropdownMenuItem asChild>
            <Link href="/w/profile" className="flex items-center gap-2">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              clearSession();
              router.push("/login");
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
