import type {
  AccountRequest,
  ActiveSession,
  ChangePasswordInput,
  CreateInviteInput,
  FacilityProfile,
  AdminProfile,
  OperationalSettings,
  PermissionLevel,
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
import type { StaffRole } from "@/lib/types/staff";

function delay<T>(value: T, ms = 160): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---- Facility — same identity as lib/mock/dashboard.ts's mockFacility ----

let facility: FacilityProfile = {
  hospitalName: "KNUST University Hospital",
  facilityType: "hospital",
  region: "Ashanti",
  address: "KNUST Campus, Kumasi",
  hefraLicense: "HFR-2024-0091",
  phone: "+233 32 206 0000",
  email: "contact@knust-hospital.test",
  specialties: ["Cardiology", "Pediatrics", "Emergency", "General Medicine", "Maternity"],
  capacity: "500",
  duration: "20",
  operatingHours: {
    alwaysOpen: false,
    schedules: [
      {
        id: "facility-default",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        open: "08:00",
        close: "17:00",
      },
    ],
  },
};

export function getFacility(): Promise<FacilityProfile> {
  return delay({ ...facility });
}

export function applyFacilityUpdate(
  input: UpdateFacilityInput
): Promise<FacilityProfile> {
  facility = { ...facility, ...input };
  return delay({ ...facility });
}

// ---- Profile & account — same identity as lib/mock/dashboard.ts's mockUser ----

let profile: AdminProfile = {
  fullName: "Dr. Sarah Jenkins",
  title: "Chief Administrator",
  email: "sarah.jenkins@knust-hospital.test",
  phone: "+233 24 555 0100",
  notificationPreferences: {
    emailOnNewAppointment: true,
    emailOnNoShow: true,
    smsOnQueueAlert: false,
    dailySummaryEmail: true,
  },
};

export function getProfile(): Promise<AdminProfile> {
  return delay({ ...profile });
}

export function applyProfileUpdate(
  input: UpdateProfileInput
): Promise<AdminProfile> {
  profile = {
    ...profile,
    ...input,
    notificationPreferences: {
      ...profile.notificationPreferences,
      ...input.notificationPreferences,
    },
  };
  return delay({ ...profile });
}

// Mock — always succeeds once a current and new password are both present.
// Real validation (current-password check, strength rules) is a backend concern.
export function applyPasswordChange(input: ChangePasswordInput): Promise<void> {
  if (!input.currentPassword || !input.newPassword) {
    return Promise.reject(new Error("Both current and new password are required."));
  }
  return delay(undefined);
}

// ---- Operational ----

let operational: OperationalSettings = {
  queuePriorityLevels: [
    { id: "emergency", label: "Emergency", weight: 3 },
    { id: "urgent", label: "Urgent", weight: 2 },
    { id: "routine", label: "Routine", weight: 1 },
  ],
  queueRefreshSeconds: 10,
  appointmentSlotMinutes: 20,
  noShowGraceMinutes: 15,
  notificationDefaults: {
    sendPatientEmailConfirmations: true,
    sendPatientSmsReminders: false,
  },
};

export function getOperational(): Promise<OperationalSettings> {
  return delay({ ...operational, queuePriorityLevels: [...operational.queuePriorityLevels] });
}

export function applyOperationalUpdate(
  input: UpdateOperationalInput
): Promise<OperationalSettings> {
  operational = {
    ...operational,
    ...input,
    notificationDefaults: {
      ...operational.notificationDefaults,
      ...input.notificationDefaults,
    },
  };
  return delay({ ...operational, queuePriorityLevels: [...operational.queuePriorityLevels] });
}

// ---- Sessions & devices ----

let sessions: ActiveSession[] = [
  {
    id: "session-current",
    device: "MacBook Pro",
    browser: "Chrome 125",
    location: "Kumasi, Ghana",
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    id: "session-mobile",
    device: "iPhone 15",
    browser: "Safari 17",
    location: "Accra, Ghana",
    lastActive: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    current: false,
  },
  {
    id: "session-tablet",
    device: "Windows 11 PC",
    browser: "Edge 124",
    location: "Kumasi, Ghana",
    lastActive: new Date(Date.now() - 18 * 3_600_000).toISOString(),
    current: false,
  },
];

export function listSessions(): Promise<ActiveSession[]> {
  return delay(sessions.map((s) => ({ ...s })));
}

export function signOutSession(id: string): Promise<void> {
  sessions = sessions.filter((s) => s.id !== id);
  return delay(undefined);
}

export function signOutAllSessions(): Promise<void> {
  // Keep the "current" session marker but wipe everything else to signal a
  // logout of remote sessions. The page navigates the user out anyway.
  sessions = [];
  return delay(undefined);
}

// ---- Two-factor authentication ----

let twoFactor: TwoFactorState = { enabled: false };

export function getTwoFactor(): Promise<TwoFactorState> {
  return delay({ ...twoFactor });
}

export function setTwoFactor(enabled: boolean): Promise<TwoFactorState> {
  twoFactor = { enabled };
  return delay({ ...twoFactor });
}

// ---- Preferences ----

let preferences: UserPreferences = {
  language: "en-US",
  timezone: "Africa/Accra",
  dateLocale: "en-US",
};

export function getPreferences(): Promise<UserPreferences> {
  return delay({ ...preferences });
}

export function applyPreferencesUpdate(
  input: Partial<UserPreferences>
): Promise<UserPreferences> {
  preferences = { ...preferences, ...input };
  return delay({ ...preferences });
}

// ---- Danger zone ----

let accountRequest: AccountRequest = { type: "deactivate", status: "none", requestedAt: "" };

export function getAccountRequest(): Promise<AccountRequest> {
  return delay({ ...accountRequest });
}

export function submitAccountRequest(
  input: SubmitAccountRequestInput
): Promise<AccountRequest> {
  // Mock — stores the request; does NOT delete or deactivate anything.
  accountRequest = {
    type: input.type,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  return delay({ ...accountRequest });
}

// ---- Team & access: invites ----

let invites: RoleInvite[] = [
  {
    id: "invite-1",
    email: "newdoctor@knust-hospital.test",
    role: "doctor",
    invitedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    status: "pending",
  },
];

export function listInvites(): Promise<RoleInvite[]> {
  return delay(invites.map((i) => ({ ...i })));
}

export function createInvite(input: CreateInviteInput): Promise<RoleInvite> {
  const invite: RoleInvite = {
    id: crypto.randomUUID(),
    email: input.email,
    role: input.role,
    invitedAt: new Date().toISOString(),
    status: "pending",
  };
  invites = [invite, ...invites];
  return delay({ ...invite });
}

export function cancelInvite(id: string): Promise<void> {
  invites = invites.filter((i) => i.id !== id);
  return delay(undefined);
}

// ---- Team & access: permission matrix ----
//
// Descriptive record-keeping only — see module note at the top of
// lib/types/settings.ts. Nothing reads this matrix to gate UI or requests.

// Stable column order for the matrix UI.
const ROLES: StaffRole[] = ["admin", "doctor", "nurse", "front-desk", "read-only"];

function row(
  resource: string,
  levels: Record<StaffRole, PermissionLevel>,
): PermissionMatrixRow {
  return { resource, permissions: levels };
}

let permissionMatrix: PermissionMatrixRow[] = [
  row("Departments", { admin: "edit", doctor: "view", nurse: "view", "front-desk": "view", "read-only": "view" }),
  row("Live Queue", { admin: "edit", doctor: "edit", nurse: "edit", "front-desk": "edit", "read-only": "view" }),
  row("Appointments", { admin: "edit", doctor: "edit", nurse: "edit", "front-desk": "edit", "read-only": "view" }),
  row("Patients", { admin: "edit", doctor: "edit", nurse: "edit", "front-desk": "edit", "read-only": "view" }),
  row("Staff & Doctors", { admin: "edit", doctor: "view", nurse: "view", "front-desk": "view", "read-only": "view" }),
  row("Analytics", { admin: "edit", doctor: "view", nurse: "none", "front-desk": "none", "read-only": "view" }),
  row("Settings", { admin: "edit", doctor: "none", nurse: "none", "front-desk": "none", "read-only": "none" }),
];

export function getPermissionMatrix(): Promise<PermissionMatrixRow[]> {
  return delay(permissionMatrix.map((r) => ({ ...r, permissions: { ...r.permissions } })));
}

export function applyPermissionUpdate(
  input: UpdatePermissionInput
): Promise<PermissionMatrixRow[]> {
  permissionMatrix = permissionMatrix.map((r) =>
    r.resource === input.resource
      ? { ...r, permissions: { ...r.permissions, [input.role]: input.level } }
      : r,
  );
  return getPermissionMatrix();
}

export { ROLES as PERMISSION_ROLES };
