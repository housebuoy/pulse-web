

import { api } from "@/lib/axios";
import type {
  LoginCredentials,
  SessionRole,
  WorkspaceSession,
} from "@/lib/types/auth";


const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

interface LoginResponse {
  token: string | null;
  role: string;
  userId: number;
  message: string;
  session: WorkspaceSession;
  devOtp?: string | null;
}

/** One activated doctor account so /w can be built and previewed immediately. */
export const MOCK_DOCTOR_SESSION: WorkspaceSession = {
  staffId: "staff-owusu",
  role: "doctor",
  name: "Dr. Owusu",
  email: "owusu@pulsehealth.test",
  facilityId: "facility-knust",
  departmentId: "cardiology",
  departmentName: "Cardiology",
  title: "Cardiologist",
  specialty: "Interventional Cardiology",
};

/** Admin session identity (matches lib/mock/dashboard.ts mockUser). */
export const MOCK_ADMIN_SESSION: WorkspaceSession = {
  staffId: "staff-admin",
  role: "admin",
  name: "Dr. Sarah Jenkins",
  email: "sarah.jenkins@knust-hospital.test",
  facilityId: "facility-knust",
  departmentId: "general-medicine",
  departmentName: "General Medicine",
  title: "Chief Administrator",
};


export const DEMO_PASSWORD = "Password123!";

const ACCOUNTS: WorkspaceSession[] = [MOCK_ADMIN_SESSION, MOCK_DOCTOR_SESSION];

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface LoginResult {
  session: WorkspaceSession;
  // null on the first login step — the real 2FA flow issues the token
  // from verifyLoginOtp after the OTP is confirmed (lib/api/auth.ts).
  token: string | null;
  // Dev-mode only: the backend echoes the verification code (otp.dev-mode).
  // Absent in prod — the UI shows it in a toast to speed up manual testing.
  devOtp?: string | null;
}

export function login({ email, password }: LoginCredentials): Promise<LoginResult> {
  if (!USE_MOCK) {
    // Real backend (2FA): POST /api/auth/login validates credentials and
    // issues a verification code; token comes from verifyLoginOtp.
    return api
      .post<LoginResponse>("/auth/login", { email, password })
      .then(({ data }) => ({
        session: data.session,
        token: data.token ?? null,
        devOtp: data.devOtp ?? null,
      }));
  }
  const session = ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!session || password !== DEMO_PASSWORD) {
    return Promise.reject(new Error("Invalid email or password."));
  }
  return delay({ session, token: `mock-session.${session.staffId}` });
}

/** Result of a successful OTP verification — the real session token. */
export interface OtpVerifyResult {
  // null when the backend response carries no token yet (callers fall back
  // to the pending login token).
  token: string | null;
}

// Second factor, wired for every login on an untrusted device (see
// isDeviceTrusted below). Mock: any 6-digit code passes, same convention
// as app/(auth)/activate/page.tsx.
// Real: POST /api/auth/login/verify-otp validates the code server-side and
// returns the real JWT; the mock returns null so callers fall back to the
// mock login token.
export async function verifyLoginOtp(
  code: string,
  email?: string,
): Promise<OtpVerifyResult | null> {
  if (!USE_MOCK) {
    const { data } = await api.post<LoginResponse>("/auth/login/verify-otp", {
      email,
      code,
    });
    return { token: data.token };
  }
  if (code.length !== 6) throw new Error("Enter all 6 digits.");
  return delay(null, 200);
}

/**
 * Resolves the full session for a stored token. Mock tokens decode locally;
 * real JWTs are opaque to the frontend, so the session is fetched from
 * GET /api/auth/me (token attached by the axios interceptor).
 */
export async function fetchSession(token: string): Promise<WorkspaceSession> {
  if (USE_MOCK) {
    const session = resolveSession(token);
    if (!session) throw new Error("No session for token");
    return session;
  }
  const { data } = await api.get<WorkspaceSession>("/auth/me");
  return data;
}

// ---- Session storage ----
//
// Reuses the exact `pulse_token` key lib/axios.ts already reads as the
// bearer token, and the exact key the /d sidebar's logout already clears —
// this is the one existing thread this file pulls on, not a parallel store.
const TOKEN_KEY = "pulse_token";
const TOKEN_EXPIRES_KEY = "pulse_token_expires_at";
const TRUSTED_DEVICE_KEY = "pulse_trusted_device";

// Mock convenience only: a real session's lifetime is enforced by the
// backend (JWT `exp` claim, checked server-side on every request) — the
// client never gets to decide it's still logged in. This client-side
// timestamp exists purely so the demo can show a session actually going
// stale instead of sitting valid in localStorage forever.
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function resolveSession(token: string | null): WorkspaceSession | null {
  if (!token) return null;
  const staffId = token.startsWith("mock-session.")
    ? token.slice("mock-session.".length)
    : null;
  if (!staffId) return null;
  return ACCOUNTS.find((a) => a.staffId === staffId) ?? null;
}

export function getStoredSession(): WorkspaceSession | null {
  if (typeof window === "undefined") return null;
  const expiresAt = Number(window.localStorage.getItem(TOKEN_EXPIRES_KEY));
  if (!expiresAt || Date.now() > expiresAt) {
    clearSession();
    return null;
  }
  return resolveSession(window.localStorage.getItem(TOKEN_KEY));
}

/** Persists the token from a completed login (password, or password+OTP).
 *  Also stamps a 24h mock expiry — see SESSION_DURATION_MS above. */
/** Persists the token from a completed login (password, or password+OTP). */
export function finalizeLogin(token: string | null): void {
   if (typeof window !== "undefined" && token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(
      TOKEN_EXPIRES_KEY,
      String(Date.now() + SESSION_DURATION_MS),
    );
  }
}

/** Builds the storage token for a known session — for flows (like account
 *  activation) that establish a session without going through login(). */
export function tokenForSession(session: WorkspaceSession): string {
  return `mock-session.${session.staffId}`;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_EXPIRES_KEY);
  }
}

// DECISION: OTP is required only on a new/unrecognized device, not every
// login. Every-login OTP is the safer default for a real facility, but it
// makes this demo (and any future manual QA pass) tedious to re-verify on
// every reload; "new device" is also the more common real-world pattern
// (see the existing ActiveSession/trusted-device concept already modeled
// in Settings, lib/types/settings.ts). Mock approximation: one browser-wide
// trusted flag rather than a per-account device list — good enough to
// demonstrate the branch, not meant to be the real device-fingerprinting
// logic the backend will eventually own.
export function isDeviceTrusted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(TRUSTED_DEVICE_KEY) === "1";
}

export function markDeviceTrusted(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TRUSTED_DEVICE_KEY, "1");
  }
}

// Where a role lands after sign-in — not mock-specific, this mapping
// survives the swap to real auth unchanged.
export function roleHome(role: SessionRole): string {
  return role === "admin" ? "/d/overview" : "/w/queue";
}

// ---- Password reset (facility staff, email-based) ----
//
// Staff-scoped and EMAIL-based on purpose: the patient (mobile) app resets
// against a phone number + SMS code, and that flow does not share these
// endpoints. This is also NOT the logged-in change-password path
// (lib/api/settings.ts changePassword) — no session exists here, so the
// second step issues a short-lived reset token that stands in for one.
//
// Three steps, mirroring the login/OTP split above:
//   requestPasswordReset(email)      → emails a 6-digit code
//   verifyResetCode(email, code)     → exchanges the code for a reset token
//   resetPassword(token, password)   → sets the new password
//
// Real endpoints are noted per-function and in BACKEND_SPEC.md §6.13.

/** Result of a verified reset code — the short-lived token step 3 spends. */
export interface ResetVerifyResult {
  resetToken: string;
}

/**
 * Step 1 — ask for a reset code at a work email.
 *
 * Resolves whether or not the address belongs to an account: a real
 * backend must not let this endpoint confirm which work emails exist, so
 * the UI always advances to the code step. The mock mirrors that instead
 * of rejecting unknown addresses, so the screens behave the same either
 * way.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ devOtp?: string | null }> {
  if (!USE_MOCK) {
    // Real: POST /api/auth/password-reset/request — always advances, never
    // reveals whether the account exists. Dev mode on the backend echoes the
    // code (devOtp) so hand-tests work before real inboxes exist.
    const { data } = await api.post<{ message?: string; devOtp?: string | null }>(
      "/auth/password-reset/request",
      { email },
    );
    return { devOtp: data.devOtp ?? null };
  }
  if (!email.trim()) throw new Error("Enter your work email.");
  await delay(undefined, 400);
  return { devOtp: null };
}

/**
 * Step 2 — verify the emailed code. Mock: any 6-digit code passes, same
 * convention as login OTP and app/(auth)/activate.
 * Real: POST /api/auth/password-reset/verify validates the code
 * server-side and returns the single-use reset token.
 */
export async function verifyResetCode(
  email: string,
  code: string,
): Promise<ResetVerifyResult> {
  if (!USE_MOCK) {
    const { data } = await api.post<{ resetToken: string }>(
      "/auth/password-reset/verify",
      { email, code },
    );
    return { resetToken: data.resetToken };
  }
  if (code.length !== 6) throw new Error("Enter all 6 digits.");
  return delay({ resetToken: `mock-reset.${Date.now()}` }, 300);
}

/**
 * Step 3 — spend the reset token on a new password. Does NOT sign the user
 * in: they go back to /login and authenticate normally, so the existing
 * role redirect (roleHome) decides /d vs /w. Real: POST
 * /api/auth/password-reset/confirm, which must also invalidate the token
 * and every existing session for that account.
 */
export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<void> {
  if (!USE_MOCK) {
    // The confirm endpoint needs the email too; it was stored alongside the
    // reset token by the verify step (storeResetToken).
    const reset = getResetToken();
    await api.post("/auth/password-reset/confirm", {
      email: reset?.email ?? "",
      resetToken,
      newPassword,
    });
    return;
  }
  if (!resetToken) throw new Error("This reset link has expired. Start again.");
  if (!newPassword) throw new Error("Enter a new password.");
  return delay(undefined, 400);
}

// Carries the verified reset token (and the email it belongs to) from the
// verify step to /new-password. sessionStorage, not localStorage — unlike
// the session token this is a short-lived credential for one in-progress
// reset, and it should not outlive the tab. Cleared as soon as the
// password is set, and whenever /new-password is reached without one.
const RESET_TOKEN_KEY = "pulse_reset_token";
const RESET_EMAIL_KEY = "pulse_reset_email";

export function storeResetToken(token: string, email: string): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(RESET_TOKEN_KEY, token);
    window.sessionStorage.setItem(RESET_EMAIL_KEY, email);
  }
}

export function getResetToken(): { token: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const token = window.sessionStorage.getItem(RESET_TOKEN_KEY);
  if (!token) return null;
  return { token, email: window.sessionStorage.getItem(RESET_EMAIL_KEY) ?? "" };
}

export function clearResetToken(): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RESET_TOKEN_KEY);
    window.sessionStorage.removeItem(RESET_EMAIL_KEY);
  }
}
