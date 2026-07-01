// Backend contract for Settings. Spring Boot serializes to these shapes.
//
// Facility/profile fields are NOT a parallel model — they extend the same
// OnboardingData shape collected during onboarding, so Settings is the edit
// surface for that data rather than a second source of truth.
//
// CONSTRAINT: nothing in this module is enforced client-side. Team & Access
// stores role/permission data via the mock so it can be viewed and edited,
// but Pulse does not gate routes or actions on it — enforcement belongs to
// Spring Boot RBAC. See PERMISSION_NOTICE in lib/mock/settings.ts.

import type { OnboardingData } from "@/store/use-onboarding-store";
import type { StaffRole } from "@/lib/types/staff";

// ---- Facility ----

export type FacilityType = "hospital" | "clinic" | "health_center" | "diagnostic_center";

export interface FacilityProfile extends Omit<OnboardingData, "document"> {
  facilityType: FacilityType;
}

export type UpdateFacilityInput = Partial<FacilityProfile>;

// ---- Profile & account ----

export interface PersonalNotificationPreferences {
  emailOnNewAppointment: boolean;
  emailOnNoShow: boolean;
  smsOnQueueAlert: boolean;
  dailySummaryEmail: boolean;
}

export interface AdminProfile {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  avatarUrl?: string; // object URL from ImageUpload (mock-only; not persisted past refresh)
  notificationPreferences: PersonalNotificationPreferences;
}

export type UpdateProfileInput = Partial<
  Omit<AdminProfile, "notificationPreferences">
> & {
  notificationPreferences?: Partial<PersonalNotificationPreferences>;
};

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ---- Sessions & devices ----

export interface ActiveSession {
  id: string;
  device: string; // "MacBook Pro", "iPhone 15", …
  browser: string; // "Chrome 125", "Safari", …
  location: string; // city / country, mock-provided
  lastActive: string; // ISO datetime
  current: boolean; // this session
}

// ---- Two-factor authentication ----

export interface TwoFactorState {
  enabled: boolean;
}

// ---- Preferences ----

export interface UserPreferences {
  language: string; // BCP-47, e.g. "en-US"
  timezone: string; // IANA tz, e.g. "Africa/Accra"
  dateLocale: string; // BCP-47 locale that drives lib/format.ts at runtime
}

// ---- Danger zone ----

export type AccountRequestType = "deactivate" | "delete";

export interface AccountRequest {
  type: AccountRequestType;
  requestedAt: string; // ISO datetime
  status: "pending" | "none";
}

export interface SubmitAccountRequestInput {
  type: AccountRequestType;
  /** Admin to transfer facility ownership to before the request is processed. */
  transferOwnershipTo?: string;
}

// ---- Operational ----

export interface QueuePriorityLevel {
  id: string;
  label: string;
  weight: number; // higher = served sooner, mirrors lib/queue-utils.ts priorityRank
}

export interface FacilityNotificationDefaults {
  sendPatientEmailConfirmations: boolean;
  sendPatientSmsReminders: boolean;
}

export interface OperationalSettings {
  queuePriorityLevels: QueuePriorityLevel[];
  queueRefreshSeconds: number;
  appointmentSlotMinutes: number;
  noShowGraceMinutes: number;
  notificationDefaults: FacilityNotificationDefaults;
}

export type UpdateOperationalInput = Partial<
  Omit<OperationalSettings, "notificationDefaults">
> & {
  notificationDefaults?: Partial<FacilityNotificationDefaults>;
};

// ---- Team & access ----

export interface RoleInvite {
  id: string;
  email: string;
  role: StaffRole;
  invitedAt: string; // ISO datetime
  status: "pending";
}

export interface CreateInviteInput {
  email: string;
  role: StaffRole;
}

export type PermissionLevel = "none" | "view" | "edit";

export interface PermissionMatrixRow {
  resource: string; // "Departments", "Appointments", ...
  permissions: Record<StaffRole, PermissionLevel>;
}

export interface UpdatePermissionInput {
  resource: string;
  role: StaffRole;
  level: PermissionLevel;
}
