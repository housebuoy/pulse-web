// App-level session type. Shared by both the admin (/d) and doctor (/w)
// workspaces. Real implementation uses JWT / server cookie; mock uses a
// static fixture that drives /w preview without wiring real invites.

export type SessionRole = "admin" | "doctor";

export interface WorkspaceSession {
  staffId: string;
  role: SessionRole;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  title: string;
  specialty?: string;
  avatarUrl?: string;
}
