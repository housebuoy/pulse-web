import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as settingsApi from "@/lib/api/settings";
import type {
  ChangePasswordInput,
  CreateInviteInput,
  SubmitAccountRequestInput,
  UpdateFacilityInput,
  UpdateOperationalInput,
  UpdatePermissionInput,
  UpdateProfileInput,
  UserPreferences,
} from "@/lib/types/settings";

const keys = {
  all: ["settings"] as const,
  facility: ["settings", "facility"] as const,
  profile: ["settings", "profile"] as const,
  operational: ["settings", "operational"] as const,
  invites: ["settings", "invites"] as const,
  permissions: ["settings", "permissions"] as const,
};

// ---- Facility ----

export function useFacility() {
  return useQuery({ queryKey: keys.facility, queryFn: settingsApi.fetchFacility });
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFacilityInput) => settingsApi.updateFacility(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.facility }),
  });
}

// ---- Profile & account ----

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: settingsApi.fetchProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => settingsApi.updateProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.profile }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => settingsApi.changePassword(input),
  });
}

// ---- Operational ----

export function useOperational() {
  return useQuery({
    queryKey: keys.operational,
    queryFn: settingsApi.fetchOperational,
  });
}

export function useUpdateOperational() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOperationalInput) =>
      settingsApi.updateOperational(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.operational }),
  });
}

// ---- Sessions & devices ----

export function useSessions() {
  return useQuery({ queryKey: ["settings", "sessions"], queryFn: settingsApi.fetchSessions });
}

export function useSignOutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.signOutSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "sessions"] }),
  });
}

export function useSignOutAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => settingsApi.signOutAllSessions(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "sessions"] }),
  });
}

// ---- Two-factor authentication ----

export function useTwoFactor() {
  return useQuery({ queryKey: ["settings", "2fa"], queryFn: settingsApi.fetchTwoFactor });
}

export function useUpdateTwoFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => settingsApi.updateTwoFactor(enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "2fa"] }),
  });
}

// ---- Preferences ----

export function usePreferences() {
  return useQuery({ queryKey: ["settings", "preferences"], queryFn: settingsApi.fetchPreferences });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserPreferences>) => settingsApi.updatePreferences(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "preferences"] }),
  });
}

// ---- Danger zone ----

export function useAccountRequest() {
  return useQuery({ queryKey: ["settings", "account-request"], queryFn: settingsApi.fetchAccountRequest });
}

export function useSubmitAccountRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitAccountRequestInput) => settingsApi.submitAccountRequest(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "account-request"] }),
  });
}

// ---- Team & access: invites ----

export function useInvites() {
  return useQuery({ queryKey: keys.invites, queryFn: settingsApi.fetchInvites });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInviteInput) => settingsApi.createInvite(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.invites }),
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.cancelInvite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.invites }),
  });
}

// ---- Team & access: permission matrix ----

export function usePermissionMatrix() {
  return useQuery({
    queryKey: keys.permissions,
    queryFn: settingsApi.fetchPermissionMatrix,
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePermissionInput) => settingsApi.updatePermission(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.permissions }),
  });
}
