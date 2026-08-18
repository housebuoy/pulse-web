// Mock auth for local development and previews. Real enforcement lives in
// Spring Boot — these fixtures never reach prod. Everything below is the
// single swap point for later: replace login()/verifyLoginOtp() with real
// API calls and resolveSession() with real JWT decode, keep every call site
// (hooks/use-workspace-session.ts, components/auth/require-role.tsx,
// app/(auth)/login/page.tsx) unchanged.

import { api } from "@/lib/axios";
import type {
  LoginCredentials,
  SessionRole,
  WorkspaceSession,
} from "@/lib/types/auth";

// The swap flag shared by every other domain's lib/api/*.ts — mock is the
// default; set NEXT_PUBLIC_USE_MOCK=false to hit the Spring Boot backend.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

/** Backend POST /api/auth/login response shape (LoginResponse). */
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

// ---- Login ----
//
// Mock-only: any of the two seeded emails below signs in with the shared
// demo password. Real validation (password hashing, lockouts, rate
// limiting) is a backend concern — same permissiveness pattern as every
// other mock in this repo (see lib/mock/settings.ts applyPasswordChange).
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
}

export function login({ email, password }: LoginCredentials): Promise<LoginResult> {
  if (!USE_MOCK) {
    // Real backend (2FA): POST /api/auth/login validates credentials and
    // issues a verification code; token comes from verifyLoginOtp.
    return api
      .post<LoginResponse>("/auth/login", { email, password })
      .then(({ data }) => ({ session: data.session, token: data.token ?? null }));
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
const TRUSTED_DEVICE_KEY = "pulse_trusted_device";

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
  return resolveSession(window.localStorage.getItem(TOKEN_KEY));
}

/** Persists the token from a completed login (password, or password+OTP). */
export function finalizeLogin(token: string | null): void {
  if (typeof window !== "undefined" && token) {
    window.localStorage.setItem(TOKEN_KEY, token);
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
