// App-level session type. Shared by both the admin (/d) and doctor (/w)
// workspaces — one login, one session shape, role decides where you land.
// Real implementation uses JWT / server cookie; mock resolves it from a
// token in localStorage. See lib/mock/auth.ts and hooks/use-workspace-session.ts.

export type SessionRole = "admin" | "doctor";

export interface WorkspaceSession {
  staffId: string;
  role: SessionRole;
  name: string;
  email: string;
  facilityId: string;
  departmentId: string;
  departmentName: string;
  title: string;
  specialty?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
