// Mock access-request flow: a prospective facility asks to join Pulse,
// before it has any account or onboarding data. This is also where the full
// facility profile (identity + optional HeFRA credentials) AND the
// requester's email are captured and verified — /onboarding (departments →
// admin) only fills in operational detail on top of it; it doesn't
// re-collect facility identity or ask for the admin's email again, since
// requester === admin (one person, one email). Real implementation: the
// backend reviews the request and emails an approval link carrying a real
// token; /onboarding verifies that token server-side. Here, submission
// issues a mock token (not yet stored — see app/(auth)/request-access) so
// the onboarding flow stays previewable without a real email system.

export interface AccessRequestInput {
  facilityName: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  address: string;
  /** Required to submit — see app/(auth)/request-access. Object URL from
   *  ImageUpload (mock-only; not persisted past refresh). */
  logoUrl: string;
  /** Optional — speeds up verification; see the compliance grace-period
   *  flow this enables (BACKEND_SPEC.md §4.6). */
  hefraLicense: string;
  /** Optional, same reason as hefraLicense. */
  document: File | null;
}

const APPROVAL_TOKEN_KEY = "pulse_onboarding_token";

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function submitAccessRequest(
  _input: AccessRequestInput,
): Promise<{ token: string }> {
  return delay({ token: `mock-approval.${Date.now()}` });
}

export function storeApprovalToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(APPROVAL_TOKEN_KEY, token);
  }
}

export function getApprovalToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(APPROVAL_TOKEN_KEY);
}

/** Mirrors the server-side check a real backend would do against the
 *  token in a clicked email-approval link — here, any token shaped like
 *  the one submitAccessRequest issues. */
export function isValidApprovalToken(token: string): boolean {
  return token.startsWith("mock-approval.");
}

export function clearApprovalToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(APPROVAL_TOKEN_KEY);
  }
}

// ---- Requester email ----
//
// Stored the moment the (mock) OTP verifies — independent of approval, the
// same way a real backend would already have this on file for a pending
// request whether or not an operator has approved it yet. /onboarding
// reads it once the approval token resolves and seeds it into
// OnboardingData.adminEmail — see app/(auth)/onboarding.
const REQUEST_EMAIL_KEY = "pulse_request_email";

export function storeRequestEmail(email: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REQUEST_EMAIL_KEY, email);
  }
}

export function getRequestEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REQUEST_EMAIL_KEY);
}

export function clearRequestEmail(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(REQUEST_EMAIL_KEY);
  }
}
