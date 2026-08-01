import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { RequireRole } from "@/components/auth/require-role";

// /w is the doctor workspace — shares lib/, hooks/, components/ui/, and all
// design primitives with /d. The only fork is this shell (sidebar + layout)
// and the scoped page components in app/(workspace)/w/*.
// Real role enforcement is in Spring Boot; this layout is presentational only.
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allow={["doctor"]}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-surface-subtle">
          <WorkspaceSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </TooltipProvider>
    </RequireRole>
  );
}
