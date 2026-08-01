"use client";

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useFacility } from "@/hooks/use-settings";
import { FacilityStatusBanner } from "./facility-status-banner";
import { FacilitySuspendedBlock } from "./facility-suspended-block";
import type { FacilityAccountStatus } from "@/lib/types/settings";

function FacilityStatusGateBody({ children }: { children: ReactNode }) {
  const { data: facility } = useFacility();
  const searchParams = useSearchParams();

  // Dev-only preview override — e.g. /d/overview?facilityStatus=suspended —
  // so both grace states are easy to demo without editing mock data.
  // Never read/written anywhere outside this one line.
  const override = searchParams.get("facilityStatus") as FacilityAccountStatus | null;
  const status = override ?? facility?.status;

  if (status === "suspended") {
    return <FacilitySuspendedBlock />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {status === "active_pending_docs" && (
        <FacilityStatusBanner dueDate={facility?.hefraDueDate} />
      )}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export function FacilityStatusGate({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<div className="flex h-screen flex-col overflow-hidden">{children}</div>}
    >
      <FacilityStatusGateBody>{children}</FacilityStatusGateBody>
    </Suspense>
  );
}
