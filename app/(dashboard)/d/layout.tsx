import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-surface-subtle print:h-auto print:overflow-visible">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
