// Swap point. USE_MOCK true → resolves from lib/mock/settings.
// Flip the flag and the same functions hit Spring Boot. Hooks/components don't move.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/settings";
import type {
  AccountRequest,
  ActiveSession,
  ChangePasswordInput,
  CreateInviteInput,
  AdminProfile,
  FacilityProfile,
  OperationalSettings,
  PermissionMatrixRow,
  RoleInvite,
  SubmitAccountRequestInput,
  TwoFactorState,
  UpdateFacilityInput,
  UpdateOperationalInput,
  UpdatePermissionInput,
  UpdateProfileInput,
  UserPreferences,
} from "@/lib/types/settings";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// ---- Facility ----

export async function fetchFacility(): Promise<FacilityProfile> {
  if (USE_MOCK) return mock.getFacility();
  const { data } = await api.get<FacilityProfile>("/settings/facility");
  return data;
}

export async function updateFacility(
  input: UpdateFacilityInput
): Promise<FacilityProfile> {
  if (USE_MOCK) return mock.applyFacilityUpdate(input);
  const { data } = await api.patch<FacilityProfile>("/settings/facility", input);
  return data;
}

// ---- Profile & account ----

export async function fetchProfile(): Promise<AdminProfile> {
  if (USE_MOCK) return mock.getProfile();
  const { data } = await api.get<AdminProfile>("/settings/profile");
  return data;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<AdminProfile> {
  if (USE_MOCK) return mock.applyProfileUpdate(input);
  const { data } = await api.patch<AdminProfile>("/settings/profile", input);
  return data;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  if (USE_MOCK) return mock.applyPasswordChange(input);
  await api.post("/settings/profile/change-password", input);
}

// ---- Operational ----

export async function fetchOperational(): Promise<OperationalSettings> {
  if (USE_MOCK) return mock.getOperational();
  const { data } = await api.get<OperationalSettings>("/settings/operational");
  return data;
}

export async function updateOperational(
  input: UpdateOperationalInput
): Promise<OperationalSettings> {
  if (USE_MOCK) return mock.applyOperationalUpdate(input);
  const { data } = await api.patch<OperationalSettings>(
    "/settings/operational",
    input
  );
  return data;
}

// ---- Sessions & devices ----

export async function fetchSessions(): Promise<ActiveSession[]> {
  if (USE_MOCK) return mock.listSessions();
  const { data } = await api.get<ActiveSession[]>("/settings/sessions");
  return data;
}

export async function signOutSession(id: string): Promise<void> {
  if (USE_MOCK) return mock.signOutSession(id);
  await api.delete(`/settings/sessions/${id}`);
}

export async function signOutAllSessions(): Promise<void> {
  if (USE_MOCK) return mock.signOutAllSessions();
  await api.delete("/settings/sessions");
}

// ---- Two-factor authentication ----

export async function fetchTwoFactor(): Promise<TwoFactorState> {
  if (USE_MOCK) return mock.getTwoFactor();
  const { data } = await api.get<TwoFactorState>("/settings/2fa");
  return data;
}

export async function updateTwoFactor(enabled: boolean): Promise<TwoFactorState> {
  if (USE_MOCK) return mock.setTwoFactor(enabled);
  const { data } = await api.patch<TwoFactorState>("/settings/2fa", { enabled });
  return data;
}

// ---- Preferences ----

export async function fetchPreferences(): Promise<UserPreferences> {
  if (USE_MOCK) return mock.getPreferences();
  const { data } = await api.get<UserPreferences>("/settings/preferences");
  return data;
}

export async function updatePreferences(
  input: Partial<UserPreferences>
): Promise<UserPreferences> {
  if (USE_MOCK) return mock.applyPreferencesUpdate(input);
  const { data } = await api.patch<UserPreferences>("/settings/preferences", input);
  return data;
}

// ---- Danger zone ----

export async function fetchAccountRequest(): Promise<AccountRequest> {
  if (USE_MOCK) return mock.getAccountRequest();
  const { data } = await api.get<AccountRequest>("/settings/account-request");
  return data;
}

export async function submitAccountRequest(
  input: SubmitAccountRequestInput
): Promise<AccountRequest> {
  if (USE_MOCK) return mock.submitAccountRequest(input);
  const { data } = await api.post<AccountRequest>("/settings/account-request", input);
  return data;
}

// ---- Team & access: invites ----

export async function fetchInvites(): Promise<RoleInvite[]> {
  if (USE_MOCK) return mock.listInvites();
  const { data } = await api.get<RoleInvite[]>("/settings/invites");
  return data;
}

export async function createInvite(input: CreateInviteInput): Promise<RoleInvite> {
  if (USE_MOCK) return mock.createInvite(input);
  const { data } = await api.post<RoleInvite>("/settings/invites", input);
  return data;
}

export async function cancelInvite(id: string): Promise<void> {
  if (USE_MOCK) return mock.cancelInvite(id);
  await api.delete(`/settings/invites/${id}`);
}

// ---- Team & access: permission matrix ----

export async function fetchPermissionMatrix(): Promise<PermissionMatrixRow[]> {
  if (USE_MOCK) return mock.getPermissionMatrix();
  const { data } = await api.get<PermissionMatrixRow[]>("/settings/permissions");
  return data;
}

export async function updatePermission(
  input: UpdatePermissionInput
): Promise<PermissionMatrixRow[]> {
  if (USE_MOCK) return mock.applyPermissionUpdate(input);
  const { data } = await api.patch<PermissionMatrixRow[]>(
    "/settings/permissions",
    input
  );
  return data;
}
