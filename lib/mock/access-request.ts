// Mock access-request flow: a prospective facility asks to join Pulse,
// before it has any account or onboarding data. Real implementation: the
// backend reviews the request and emails an approval link carrying a real
// token; /onboarding verifies that token server-side. Here, submission
// auto-"approves" (stores a mock token) so the onboarding flow stays
// previewable without a real email system — see app/(auth)/request-access.

export interface AccessRequestInput {
  facilityName: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
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

export function clearApprovalToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(APPROVAL_TOKEN_KEY);
  }
}
