import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireRole } from "@/components/auth/require-role";
import { FacilityStatusGate } from "@/components/dashboard/facility-status-gate";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allow={["admin"]}>
      <FacilityStatusGate>
        <TooltipProvider>
          <div className="flex h-full w-full overflow-hidden bg-surface-subtle print:h-auto print:overflow-visible">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
              {children}
            </div>
          </div>
        </TooltipProvider>
      </FacilityStatusGate>
    </RequireRole>
  );
}
