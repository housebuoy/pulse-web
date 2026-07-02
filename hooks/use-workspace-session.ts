// Returns the current workspace session.
// Today: the pre-seeded mock doctor. Real: read from JWT / httpOnly cookie /
// server-side session; this hook is the single integration point.

import { MOCK_DOCTOR_SESSION } from "@/lib/mock/auth";
import type { WorkspaceSession } from "@/lib/types/auth";

export function useWorkspaceSession(): WorkspaceSession {
  return MOCK_DOCTOR_SESSION;
}
