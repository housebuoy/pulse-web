# Pulse Health — Backend Implementation Spec

This document is derived directly from the Next.js frontend's mock-backed data
layer (`lib/api/*`, `lib/types/*`, `lib/mock/*`, `hooks/*`). It describes the
contract the Spring Boot backend must satisfy so the frontend can flip
`NEXT_PUBLIC_USE_MOCK` to `false` with zero component changes.

**Method**: every endpoint, type, and business rule below is cited to a
source file. Where the frontend does not define something (e.g. login,
appointment creation, queue check-in), that is called out explicitly as a
gap rather than invented — see §7.

---

## 1. Overview

### Architecture

Three layers, per domain (`lib/api/appointments.ts:1-5` and identical
comments in every other `lib/api/*.ts` file):

```
components/hooks  →  hooks/use-*.ts (TanStack Query)  →  lib/api/*.ts (swap point)  →  lib/mock/*.ts | axios → Spring Boot
```

- `lib/api/*.ts` is the swap point. Every exported function checks
  `USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"` (mock is the
  **default** unless the env var is the literal string `"false"`). When
  false, it calls the real REST API via the shared `axios` instance in
  `lib/axios.ts`.
- `lib/mock/*.ts` holds an in-memory array per domain, mutated for the
  session only (resets on reload/server restart). Mock business logic is
  the closest thing this codebase has to a backend spec for CRUD
  semantics — where it's silent, that's a real gap (§7).
- `hooks/use-*.ts` wraps everything in TanStack Query — query keys,
  polling (`refetchInterval`), cache invalidation on mutation.
- Every "list" endpoint returns the **full collection**, always. There is
  **no pagination, server-side filtering, or search parameter on any GET
  endpoint in the entire codebase.** All filtering/search/sort happens
  client-side over the full result set (see §6).

### Auth model (as it exists today — see gaps in §5)

- `lib/axios.ts:14-18` — every request attaches `Authorization: Bearer
  <token>`, where `token = localStorage.getItem("pulse_token")`.
- `lib/axios.ts:21-29` — a response interceptor is wired to bounce to
  `/login` on `401`, but the actual redirect/store-clear logic is
  commented out (placeholder only).
- **There is no `lib/api/auth.ts`.** No login, logout, refresh, or
  register endpoint is defined anywhere in the API layer. `pulse_token`
  is simply read from `localStorage` — nothing in the frontend shows how
  it gets there.
- Session identity is currently a **static fixture**, not a real session:
  `hooks/use-workspace-session.ts` returns `MOCK_DOCTOR_SESSION` from
  `lib/mock/auth.ts` unconditionally. Comment: *"Real: read from JWT /
  httpOnly cookie / server-side session; this hook is the single
  integration point."*
- No `middleware.ts` exists — **zero route protection is enforced
  client-side.** `/d` (admin) and `/w` (doctor) routes are reachable by
  anyone; access control is entirely a backend responsibility (§5).

### Base URL / versioning

`lib/axios.ts:5` — `baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"`.
No version prefix (`/v1`, etc.) appears anywhere. All paths below are
relative to this base.

---

## 2. Data models

Types are reproduced verbatim from `lib/types/*.ts`. Fields never accepted
as client input (only ever server/mock-computed) are marked **[server-only]**.

### 2.1 Auth / Session — `lib/types/auth.ts`

```ts
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
```

Note: `SessionRole` (2 values: `admin | doctor`) is narrower than
`StaffRole` (5 values, §2.6) — the app currently only branches `/d` vs
`/w` routing on this 2-way split, even though the permission matrix (§2.8)
models 5 distinct roles.

### 2.2 Appointments — `lib/types/appointments.ts`

```ts
export type AppointmentStatus =
  | "scheduled"   // booked, patient hasn't confirmed
  | "confirmed"   // patient confirmed they're coming
  | "checked_in"  // patient has arrived (hand-off point to Live Queue)
  | "completed"   // visit finished
  | "cancelled"   // called off ahead of time
  | "no_show";    // confirmed but never arrived

export type AppointmentType = "in_person" | "virtual";
export type AppointmentPriority = "emergency" | "urgent" | "routine";

export interface Appointment {
  id: string;
  reference: string;        // human-facing code, e.g. "APT-1041"
  patientId: string;
  patientName: string;
  departmentId: string;
  departmentName: string;
  doctorName: string;
  scheduledAt: string;      // ISO datetime
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  priority: AppointmentPriority;
  reason?: string;
}

export interface AppointmentDepartment { id: string; name: string; }

export interface AppointmentStats {
  total: number; scheduled: number; confirmed: number;
  checkedIn: number; completed: number; cancelled: number; noShow: number;
}

export interface AppointmentFilters {
  date: string;                          // YYYY-MM-DD
  departmentId?: string | "all";
  status?: AppointmentStatus | "all";
}

export interface UpdateAppointmentInput { id: string; status: AppointmentStatus; }
```

**There is no `CreateAppointmentInput` type and no create-appointment
endpoint anywhere in the codebase** — see §7.1.

### 2.3 Departments — `lib/types/departments.ts`

```ts
export type DepartmentStatus = "active" | "closed" | "archived";

export interface Department {
  id: string; name: string; code: string; description?: string;
  status: DepartmentStatus; headDoctorName: string;
  doctorsOnDuty: number; totalDoctors: number; rooms: number;   // staffing/capacity
  waiting: number; inConsultation: number;                       // [server-only, see §7.2]
  avgWaitMinutes: number; appointmentsToday: number;             // [server-only, see §7.2]
  opensAt: string; closesAt: string; twentyFourSeven?: boolean;
}

export interface DepartmentStats {
  total: number; active: number; closed: number;
  doctorsOnDuty: number; rooms: number; waiting: number;
}

export interface CreateDepartmentInput {
  name: string; code: string; description?: string; headDoctorName: string;
  totalDoctors: number; rooms: number; opensAt: string; closesAt: string;
  twentyFourSeven?: boolean;
}

export interface UpdateDepartmentInput extends Partial<Omit<CreateDepartmentInput, never>> {
  id: string; status?: DepartmentStatus;
}

export interface AssignHeadDoctorInput { id: string; headDoctorName: string; }
```

`waiting`, `inConsultation`, `avgWaitMinutes`, `appointmentsToday`,
`doctorsOnDuty` are **not** present in `UpdateDepartmentInput` — there is
no client-triggerable way to set them directly (only `createDepartment`
initializes them, and closing/archiving zeroes three of them — see §4.2).

A **second, separate, lighter-weight department list** exists:
`AppointmentDepartment { id, name }` (§2.2), served from
`GET /appointments/departments`, containing only 4 of the 6 real
departments (missing `maternity`, `laboratory`). A **third** copy exists
in the Queue domain (§2.4) with a `room` field. All three are
unsynchronized in the mock — see §7.2.

### 2.4 Live Queue — `lib/types/queue.ts`

```ts
export type QueueStatus = "waiting" | "in_consultation" | "completed" | "no_show" | "skipped";
export type QueuePriority = "routine" | "urgent" | "emergency";
export type PatientSource = "walk_in" | "appointment";

export interface QueueEntry {
  id: string;
  ticketNumber: string;      // "A-014"
  patientName: string;
  departmentId: string;
  status: QueueStatus;
  priority: QueuePriority;
  source: PatientSource;
  checkInAt: string;         // ISO — when they joined the queue
  calledAt?: string | null;  // [server-only] ISO — when moved into consultation
  clinician?: string | null; // [server-only] derived from session on call-next
  room?: string | null;      // [server-only] assigned on call-next
}

export type DepartmentSeverity = "ok" | "warning" | "critical";

export interface QueueDepartment {
  id: string; name: string;
  waiting: number;                  // [server-only] count of waiting entries
  nowServing: string | null;        // [server-only] ticket in consultation
  longestWaitMinutes: number;       // [server-only] max(minutesSince(checkInAt)) over waiting
  severity: DepartmentSeverity;     // [server-only] derived, see §4.2
}

export interface CallNextInput { departmentId: string; entryId?: string; }
export interface UpdateStatusInput { entryId: string; status: QueueStatus; }
```

`QueueEntry.patientName` is a free-text string, **not** a foreign key to
`Patient.id` — the frontend has no `patientId` on queue entries at all
(confirmed gap, `app/(workspace)/w/patients/page.tsx:29`: *"keyed by
name — mock doesn't have patientId on entries"*).

### 2.5 Patients — `lib/types/patients.ts`

Header comment (normative, repeated inline at three call sites — see §4.5):
> *"Record-keeping only. This module... must never interpret [clinical
> data]. No abnormal-vital flagging, no drug-interaction/allergy warnings,
> no triage or dosage suggestions, no risk scoring. That keeps Pulse out
> of medical-device classification."*

```ts
export type Gender = "female" | "male" | "other";
export type VisitStatus = "checked_in" | "waiting" | "in_consultation";

export interface Medication { name: string; dose: string; frequency: string; }

export interface Vitals {
  bloodPressure: string; temperature: string; pulse: string; weight: string;
  recordedAt: string; // [server-only]
}

export interface CurrentVisit {
  status: VisitStatus; departmentId: string; departmentName: string;
  since: string; appointmentId?: string;
}

export interface Patient {
  id: string;
  patientNumber: string;    // [server-only] "PT-00123", see §4.5 for format
  name: string; dateOfBirth: string; gender: Gender; phone: string;
  email?: string; address?: string;
  registeredAt: string;     // [server-only]
  bloodType?: string;
  allergies: string[];              // always [], never null
  currentMedications: Medication[]; // always [], never null
  latestVitals?: Vitals;            // single snapshot, NOT a history — see §4.5
  currentVisit?: CurrentVisit;      // read-only from this domain, see §7.3
}

export interface CreatePatientInput {
  name: string; dateOfBirth: string; gender: Gender; phone: string;
  email?: string; address?: string; bloodType?: string;
}
export interface UpdatePatientInput extends Partial<CreatePatientInput> { id: string; }
export interface UpdateClinicalRecordInput {
  id: string; allergies?: string[]; currentMedications?: Medication[];
}
export interface RecordVitalsInput { id: string; vitals: Omit<Vitals, "recordedAt">; }
```

### 2.6 Staff — `lib/types/staff.ts`

Header comment: *"Doubles as the access role used by Settings → Team &
Access (staff ARE the users — there's no separate user/role list)."*

```ts
export type StaffRole = "doctor" | "nurse" | "admin" | "front-desk" | "read-only";
export type DutyStatus = "on_duty" | "off_duty" | "on_leave";
export type AccountStatus = "active" | "deactivated";

export interface StaffMember {
  id: string; name: string; role: StaffRole; title: string;
  specialty?: string;          // doctors only
  departmentId: string;        // "" when unassigned
  departmentName: string; email: string; phone?: string;
  shiftStart: string; shiftEnd: string; // "HH:MM"; overnight (end < start) is valid, see §4.6
  dutyStatus: DutyStatus;
  accountStatus?: AccountStatus; // undefined === "active"
  avatarUrl?: string;          // mock-only, not persisted — see §6.3
}

export interface CreateStaffInput {
  name: string; role: StaffRole; title: string; specialty?: string;
  departmentId: string; departmentName: string; email: string; phone?: string;
  shiftStart: string; shiftEnd: string;
  // NOTE: no dutyStatus or accountStatus — every new member starts
  // dutyStatus="on_duty", accountStatus=active (undefined). See §4.6.
}
export interface UpdateStaffInput extends Partial<Omit<StaffMember, "id">> { id: string; }
```

### 2.7 Notifications — `lib/types/notifications.ts`

```ts
export type NotificationType = "queue" | "no_show" | "appointment" | "staff" | "summary" | "system";

export interface Notification {
  id: string; type: NotificationType; title: string; body?: string;
  createdAt: string; read: boolean;
  link?: string; // route to navigate on click; absent = no action
}
```

No `severity`/`priority` field exists — visual urgency in the UI comes
only from `type` + `read`.

### 2.8 Settings — `lib/types/settings.ts`

Header comment (normative — see §5):
> *"CONSTRAINT: nothing in this module is enforced client-side... Pulse
> does not gate routes or actions on it — enforcement belongs to Spring
> Boot RBAC."*

```ts
export type FacilityType = "hospital" | "clinic" | "health_center" | "diagnostic_center";

// Extends the same shape collected during onboarding (store/use-onboarding-store.ts) —
// Settings is the edit surface for that data, not a second source of truth.
export interface FacilityProfile {
  hospitalName: string; region: string; address: string; hefraLicense: string;
  logoUrl?: string;                 // mock-only
  phone: string; email: string; specialties: string[];
  capacity: string;                 // NOTE: string, not number — see §7.6
  duration: string;                 // NOTE: string, not number
  operatingHours: OperatingHoursValue;
  facilityType: FacilityType;
}
export type UpdateFacilityInput = Partial<FacilityProfile>;

export interface PersonalNotificationPreferences {
  emailOnNewAppointment: boolean; emailOnNoShow: boolean;
  smsOnQueueAlert: boolean; dailySummaryEmail: boolean;
}
export interface AdminProfile {
  fullName: string; title: string; email: string; phone: string;
  avatarUrl?: string;
  notificationPreferences: PersonalNotificationPreferences;
}
export type UpdateProfileInput = Partial<Omit<AdminProfile, "notificationPreferences">> & {
  notificationPreferences?: Partial<PersonalNotificationPreferences>;
};

export interface ChangePasswordInput { currentPassword: string; newPassword: string; }

export interface ActiveSession {
  id: string; device: string; browser: string; location: string;
  lastActive: string; current: boolean;
}

export interface TwoFactorState { enabled: boolean; } // no OTP/secret/QR anywhere — see §7.7

export interface UserPreferences { language: string; timezone: string; dateLocale: string; }

export type AccountRequestType = "deactivate" | "delete";
export interface AccountRequest {
  type: AccountRequestType; requestedAt: string; status: "pending" | "none";
}
export interface SubmitAccountRequestInput {
  type: AccountRequestType;
  transferOwnershipTo?: string; // defined but never read by the mock — see §7.6
}

export interface QueuePriorityLevel { id: string; label: string; weight: number; } // mirrors priorityRank, §4.2
export interface FacilityNotificationDefaults {
  sendPatientEmailConfirmations: boolean; sendPatientSmsReminders: boolean;
}
export interface OperationalSettings {
  queuePriorityLevels: QueuePriorityLevel[];
  queueRefreshSeconds: number; appointmentSlotMinutes: number; noShowGraceMinutes: number;
  notificationDefaults: FacilityNotificationDefaults;
}
export type UpdateOperationalInput = Partial<Omit<OperationalSettings, "notificationDefaults">> & {
  notificationDefaults?: Partial<FacilityNotificationDefaults>;
};

export interface RoleInvite {
  id: string; email: string; role: StaffRole; invitedAt: string; status: "pending";
}
export interface CreateInviteInput { email: string; role: StaffRole; }

export type PermissionLevel = "none" | "view" | "edit";
export interface PermissionMatrixRow {
  resource: string; permissions: Record<StaffRole, PermissionLevel>;
}
export interface UpdatePermissionInput { resource: string; role: StaffRole; level: PermissionLevel; }
```

Seed permission matrix (`lib/mock/settings.ts:285-293`) — 7 resources ×
5 roles, `none | view | edit`:

| Resource | admin | doctor | nurse | front-desk | read-only |
|---|---|---|---|---|---|
| Departments | edit | view | view | view | view |
| Live Queue | edit | edit | edit | edit | view |
| Appointments | edit | edit | edit | edit | view |
| Patients | edit | edit | edit | edit | view |
| Staff & Doctors | edit | view | view | view | view |
| Analytics | edit | view | none | none | view |
| Settings | edit | none | none | none | none |

### 2.9 Dashboard — `lib/types/dashboard.ts`

```ts
export type TrendDirection = "up" | "down";
export type Sentiment = "positive" | "negative" | "neutral";
export interface StatTrend { direction: TrendDirection; label: string; sentiment: Sentiment; }
export interface StatMetric { id: string; label: string; value: string; unit?: string; trend: StatTrend; }

export type QueueSeverity = "ok" | "warning" | "critical";
export interface DepartmentQueue {
  id: string; department: string; statusLabel: string;
  waiting: number; maxWaitMinutes: number; severity: QueueSeverity;
}

export type AlertSeverity = "critical" | "warning" | "info";
export interface DashboardAlert { id: string; severity: AlertSeverity; title: string; description: string; }

export interface VolumePoint { hour: string; walkIns: number; appointments: number; }
export interface FacilitySummary { id: string; name: string; }
export interface CurrentUser { id: string; name: string; role: string; }
```

`DepartmentQueue` duplicates `QueueDepartment` (§2.4) with different field
names and no shared backing data — see §7.2.
`CurrentUser` is a narrower, separately-shaped duplicate of
`WorkspaceSession` (§2.1) — see §7.8.

### 2.10 Analytics — `lib/types/analytics.ts`

Header comment (normative — see §4.5):
> *"All aggregation (daily rollups, totals, period-over-period,
> utilization) happens server-side. The UI only ever renders what it's
> given. Descriptive only: counts, averages, trends. No forecasting, no
> anomaly flagging, no recommended actions, no risk scoring."*

```ts
export interface DateRange { from: string; to: string; } // YYYY-MM-DD, inclusive

export interface DailyMetric {
  date: string; appointments: number; walkIns: number;
  patientVolume: number;    // appointments + walkIns
  avgWaitMinutes: number; p90WaitMinutes: number;
  served: number;           // queue throughput
  noShows: number; noShowRate: number; // 0-100
}

export interface AppointmentStatusBreakdown { status: string; label: string; count: number; }

export interface AnalyticsTotals {
  patientVolume: number; avgWaitMinutes: number; p90WaitMinutes: number;
  served: number; noShowRate: number;
}

export interface DepartmentAnalytics {
  departmentId: string; departmentName: string;
  daily: DailyMetric[]; totals: AnalyticsTotals; previousTotals: AnalyticsTotals;
  capacityPerDay: number; utilization: number; // 0-100, served vs capacity — see §4.7
}

export interface FacilityAnalytics {
  range: DateRange; daily: DailyMetric[];
  totals: AnalyticsTotals; previousTotals: AnalyticsTotals;
  appointmentsByStatus: AppointmentStatusBreakdown[];
  departments: DepartmentAnalytics[];
}

export interface AnalyticsQuery { from: string; to: string; }
```

---

## 3. Endpoints (exhaustive — every function in `lib/api/*`)

All paths relative to the base URL (§1). "Mock fallback" cites the
`lib/mock/*.ts` function called when `USE_MOCK` is true — useful as a
behavioral reference even though the real implementation is server-side.

### 3.1 Appointments — `lib/api/appointments.ts`

| Method | Path | Params | Body | Response | Mock fallback | Hook |
|---|---|---|---|---|---|---|
| GET | `/appointments` | query: `date`, `departmentId?`, `status?` (whole `AppointmentFilters` object) | — | `Appointment[]` | `queryAppointments(filters)` | `useAppointments(filters)` |
| GET | `/appointments/stats` | query: `date` | — | `AppointmentStats` | `computeStats(date)` | `useAppointmentStats(date)` |
| GET | `/appointments/departments` | — | — | `AppointmentDepartment[]` | `listDepartments()` | `useAppointmentDepartments()` |
| GET | `/appointments` | query: `from`, `to` | — | `Appointment[]` | `queryAppointmentsRange(from,to)` | `useAppointmentsRange(from,to)` |
| PATCH | `/appointments/{id}` | path `id` | `{ status: AppointmentStatus }` | `Appointment` | `applyUpdate(input)` | `useUpdateAppointment()` |

Note the **same path** `GET /appointments` serves two different query
shapes (`date`+filters for the day view, `from`/`to` for week/month range
views) — the backend must dispatch on which params are present, or the
frontend should be asked to split these into distinct paths.

**No create-appointment endpoint exists.** See §7.1.

### 3.2 Departments — `lib/api/departments.ts`

| Method | Path | Params | Body | Response | Mock fallback | Hook |
|---|---|---|---|---|---|---|
| GET | `/departments` | — | — | `Department[]` | `listDepartments()` | `useDepartments()`, `useDepartment(id)` (derived, no separate call) |
| GET | `/departments/stats` | — | — | `DepartmentStats` | `computeStats()` | `useDepartmentStats()` |
| PATCH | `/departments/{id}` | path `id` | `Omit<UpdateDepartmentInput,"id">` | `Department` | `applyUpdate(input)` | `useUpdateDepartment()` |
| POST | `/departments` | — | `CreateDepartmentInput` | `Department` | `createDepartment(input)` | `useCreateDepartment()` |
| PATCH | `/departments/{id}/head-doctor` | path `id` | `{ headDoctorName: string }` | `Department` | `assignHeadDoctor(input)` | `useAssignHeadDoctor()` |
| DELETE | `/departments/{id}` | path `id` | — | `void` | `deleteDepartment(id)` — **unconditional hard delete, no guard** | `useDeleteDepartment()` |

### 3.3 Live Queue — `lib/api/queue.ts`

| Method | Path | Params | Body | Response | Mock fallback | Hook |
|---|---|---|---|---|---|---|
| GET | `/queue/departments` | — | — | `QueueDepartment[]` | `buildDepartments(entries)` | `useQueueDepartments()` |
| GET | `/queue/entries` | query: `departmentId?` (omitted when `"all"`) | — | `QueueEntry[]` — **mock pre-filters to `waiting`/`in_consultation` only**, no status filter param exists | `getEntries(departmentId)` | `useQueueEntries(departmentId)` |
| POST | `/queue/call-next` | — | `CallNextInput` `{ departmentId, entryId? }` | `void` — **no confirmation of which entry was called; must change for real impl, see §4.1** | `promoteNext(input)` | `useCallNext()` |
| PATCH | `/queue/entries/{entryId}` | path `entryId` | `{ status: QueueStatus }` | `void` | `setStatus(id, status)` | `useUpdateQueueStatus()` |

**No check-in / create-entry endpoint exists.** See §7.1.

### 3.4 Patients — `lib/api/patients.ts`

| Method | Path | Params | Body | Response | Mock fallback | Hook |
|---|---|---|---|---|---|---|
| GET | `/patients` | — | — | `Patient[]` | `listPatients()` | `usePatients()`, `usePatient(id)` (derived) |
| GET | `/patients/{id}` | path `id` | — | `Patient` | `getPatient(id)` | **defined, never called** — see §7.3 |
| POST | `/patients` | — | `CreatePatientInput` | `Patient` | `createPatient(input)` | `useCreatePatient()` |
| PATCH | `/patients/{id}` | path `id` | `Omit<UpdatePatientInput,"id">` | `Patient` | `applyUpdate(input)` | `useUpdatePatient()` |
| PATCH | `/patients/{id}/clinical-record` | path `id` | `Omit<UpdateClinicalRecordInput,"id">` — `{allergies?, currentMedications?}` | `Patient` | `applyClinicalRecordUpdate(input)` | `useUpdateClinicalRecord()` |
| POST | `/patients/{id}/vitals` | path `id` | `Omit<Vitals,"recordedAt">` | `Patient` | `applyVitals(input)` | `useRecordVitals()` |

**No delete/archive endpoint exists for patients** — see §4.4.

### 3.5 Staff — `lib/api/staff.ts`

| Method | Path | Params | Body | Response | Mock fallback | Hook |
|---|---|---|---|---|---|---|
| GET | `/staff` | — | — | `StaffMember[]` | `listStaff()` | `useStaff()`, `useStaffMember(id)` (derived) |
| GET | `/staff/{id}` | path `id` | — | `StaffMember` | `getStaffMember(id)` | **defined, never called** |
| PATCH | `/staff/{id}` | path `id` | `Omit<UpdateStaffInput,"id">` | `StaffMember` | `applyUpdate(input)` | `useUpdateStaff()` — **also the only mechanism for account activate/deactivate, see §4.6** |
| POST | `/staff` | — | `CreateStaffInput` | `StaffMember` | `createStaff(input)` | `useCreateStaff()` |

**No delete endpoint exists for staff.**

### 3.6 Notifications — `lib/api/notifications.ts`

| Method | Path | Params | Body | Response | Mock fallback | Hook |
|---|---|---|---|---|---|---|
| GET | `/notifications` | — | — | `Notification[]` | `listNotifications()` | `useNotifications()` |
| GET | `/notifications/unread-count` | — | — | `{ count: number }` | `getUnreadCount()` | `useUnreadCount()` |
| PATCH | `/notifications/{id}/read` | path `id` | — | `Notification[]` (full list) | `markRead(id)` | `useMarkRead()` |
| POST | `/notifications/read-all` | — | — | `Notification[]` (full list) | `markAllRead()` | `useMarkAllRead()` |

**No create, delete, or mark-unread endpoint exists.** No trigger logic
exists anywhere in the mock — see §7.5.

### 3.7 Settings — `lib/api/settings.ts`

| # | Method | Path | Body | Response | Hook |
|---|---|---|---|---|---|
| 1 | GET | `/settings/facility` | — | `FacilityProfile` | `useFacility()` |
| 2 | PATCH | `/settings/facility` | `UpdateFacilityInput` | `FacilityProfile` | `useUpdateFacility()` |
| 3 | GET | `/settings/profile` | — | `AdminProfile` | `useProfile()` |
| 4 | PATCH | `/settings/profile` | `UpdateProfileInput` | `AdminProfile` | `useUpdateProfile()` |
| 5 | POST | `/settings/profile/change-password` | `ChangePasswordInput` | `void` | `useChangePassword()` |
| 6 | GET | `/settings/operational` | — | `OperationalSettings` | `useOperational()` |
| 7 | PATCH | `/settings/operational` | `UpdateOperationalInput` | `OperationalSettings` | `useUpdateOperational()` |
| 8 | GET | `/settings/sessions` | — | `ActiveSession[]` | `useSessions()` |
| 9 | DELETE | `/settings/sessions/{id}` | — | `void` | `useSignOutSession()` |
| 10 | DELETE | `/settings/sessions` | — | `void` | `useSignOutAllSessions()` |
| 11 | GET | `/settings/2fa` | — | `TwoFactorState` | `useTwoFactor()` |
| 12 | PATCH | `/settings/2fa` | `{ enabled: boolean }` | `TwoFactorState` | `useUpdateTwoFactor()` |
| 13 | GET | `/settings/preferences` | — | `UserPreferences` | `usePreferences()` |
| 14 | PATCH | `/settings/preferences` | `Partial<UserPreferences>` | `UserPreferences` | `useUpdatePreferences()` |
| 15 | GET | `/settings/account-request` | — | `AccountRequest` | `useAccountRequest()` |
| 16 | POST | `/settings/account-request` | `SubmitAccountRequestInput` | `AccountRequest` | `useSubmitAccountRequest()` |
| 17 | GET | `/settings/invites` | — | `RoleInvite[]` | `useInvites()` |
| 18 | POST | `/settings/invites` | `CreateInviteInput` | `RoleInvite` | `useCreateInvite()` |
| 19 | DELETE | `/settings/invites/{id}` | — | `void` | `useCancelInvite()` |
| 20 | GET | `/settings/permissions` | — | `PermissionMatrixRow[]` | `usePermissionMatrix()` |
| 21 | PATCH | `/settings/permissions` | `UpdatePermissionInput` | `PermissionMatrixRow[]` (full matrix) | `useUpdatePermission()` |

Note: `/settings/profile`, `/settings/sessions`, `/settings/2fa`,
`/settings/preferences`, `/settings/account-request` are **shared between
admin (`/d/settings`, `/d/profile`) and doctor (`/w/profile`) roles** — a
doctor's name/title/specialty/avatar go through the Staff domain (§3.5)
instead, but password/sessions/2FA/preferences/danger-zone go through
these same Settings endpoints regardless of role.

### 3.8 Dashboard — `lib/api/dashboard.ts`

| Method | Path | Response | Mock source | Hook |
|---|---|---|---|---|
| GET | `/dashboard/stats` | `StatMetric[]` | `mockStats` (static) | `useDashboardStats()` |
| GET | `/dashboard/queue` | `DepartmentQueue[]` | `mockQueue` (static) | `useDepartmentQueue()` |
| GET | `/dashboard/alerts` | `DashboardAlert[]` | `mockAlerts` (static) | `useDashboardAlerts()` |
| GET | `/dashboard/patient-volume` | `VolumePoint[]` | `mockVolume` (static) | `usePatientVolume()` |
| GET | `/facility/current` | `FacilitySummary` | `mockFacility` (static) | `useCurrentFacility()` |
| GET | `/auth/me` | `CurrentUser` | `mockUser` (static) | `useCurrentUser()` |

All six mock sources are **hardcoded literals with zero derivation
logic** — none of them sum/average any underlying dataset. The real
backend must build genuinely new aggregation logic for all of these; see
§7.8.

### 3.9 Analytics — `lib/api/analytics.ts`

| Method | Path | Params | Response | Hook |
|---|---|---|---|---|
| GET | `/analytics` | query: `from`, `to` (YYYY-MM-DD) | `FacilityAnalytics` (entire range + every department in one payload) | `useAnalytics({from,to})` |

Single endpoint. Comment: *"the backend is expected to do the same
`{from,to}` aggregation server-side and return the same
`FacilityAnalytics` shape."* The frontend relies on getting **all**
departments in one response so switching the department selector is free
client-side selection, not a new request (`hooks/use-analytics.ts:10-12`).

---

## 4. Business rules

### 4.1 Appointment lifecycle

State machine, extracted from `lib/appointment-utils.ts:28-48`
(`actionsFor(status)`, which drives the row action buttons — this is the
only place transition legality is encoded anywhere in the frontend):

```
scheduled   → confirmed  (action: "Confirm")
scheduled   → cancelled  (action: "Cancel")
confirmed   → checked_in (action: "Check in")
confirmed   → no_show    (action: "No-show")
checked_in  → confirmed  (action: "Undo" — desk can only undo on this screen;
                           the forward hand-off to Live Queue happens elsewhere)
completed, cancelled, no_show → terminal, no actions
```

**The mock's `applyUpdate` enforces none of this** (`lib/mock/appointments.ts:354-364`)
— `PATCH /appointments/{id}` accepts any status value unconditionally,
looking the appointment up by `id` and overwriting `status` directly with
no transition check, rejecting with a generic `Error` only if the id
doesn't exist. **The backend must implement the transition table above as
a real state machine** — the frontend gives no other guidance and
currently trusts the client not to send illegal transitions.

`checked_in` is explicitly the **hand-off point to the Live Queue
domain** (comment: *"Hand-off to Live Queue happens here"*) — but no code
anywhere actually creates a `QueueEntry` when an appointment is checked
in. This hand-off is not wired in the frontend; see §7.1.

There is **no auto-confirm-booking rule anywhere in the code** — in fact
the opposite: `scheduled → confirmed` is an explicit, separate user
action ("Confirm" button), never automatic. Since no create-appointment
endpoint exists at all (§7.1), the initial status a new booking should
receive is not determinable from this codebase — don't assume
`"scheduled"` is auto-promoted to `"confirmed"`; the transition table
above shows they're kept deliberately distinct.

### 4.2 Department capacity model — what actually exists vs. what doesn't

**No capacity formula (e.g. `doctorsOnDuty × rooms`) exists anywhere in
the codebase.** Confirmed by grep across `lib/` and
`components/dashboard/departments/**` for `capacity|slot|reassign|overbook|conflict`
— zero relevant hits inside the Departments domain. `waiting`,
`inConsultation`, `avgWaitMinutes`, `appointmentsToday` are plain mutable
integers on `Department`, but **not exposed on `UpdateDepartmentInput`**
— nothing in the UI/API surface can set them directly today. This
strongly suggests they are meant to be **derived server-side from the
Queue/Appointments domains** rather than stored as raw columns, but that
is an inference, not a rule extracted from code — confirm with the team
(§7.2).

The **real** capacity/priority logic that does exist lives entirely in
the **Live Queue** domain (`lib/queue-utils.ts`, `lib/mock/queue.ts`):

- **Priority ordering** (`lib/queue-utils.ts:11-16`):
  ```ts
  export const priorityRank: Record<QueuePriority, number> = {
    emergency: 3, urgent: 2, routine: 1,
  };
  // Queue order: priority first, then longest-waiting (earliest check-in).
  ```
  This ranking also mirrors `OperationalSettings.queuePriorityLevels`
  (§2.8), which exposes the same three levels with editable `weight`
  values — i.e. the facility can reconfigure priority weighting via
  Settings, and the backend's queue-ordering logic should read from that
  configuration rather than hardcoding the mock's `priorityRank`.
- **Severity thresholds**, department-level SLA signal
  (`lib/mock/queue.ts` `buildDepartments()`):
  `longestWaitMinutes > 40 → "critical"`; `> 25 → "warning"`; else `"ok"`.
  This is the only threshold constant in the whole queue domain.
- **No `avgWaitMinutes` exists anywhere** in the Queue domain — only
  `longestWaitMinutes` (a max) and per-entry elapsed minutes
  (`minutesSince(checkInAt)`). If an average-wait metric is required, its
  definition (which entries count, weighted how) must be designed fresh.

**Auto-reassignment on doctor drop-out**: no such logic exists anywhere
in the codebase (checked Departments and Queue domains both). **Not
implemented, not inferable — must be designed from scratch** (§7.2).

**Over-capacity exception surfacing**: since no capacity check exists
anywhere, there is no corresponding exception/error path either. Not
implemented.

**Cap on simultaneous `in_consultation` entries** (one per doctor/room):
not enforced anywhere. Multiple `QueueEntry` rows can be
`in_consultation` in the same department simultaneously; nothing in
`promoteNext()` checks room or clinician occupancy before assigning.

### 4.3 Slot validation & the atomic-locking requirement (real race condition)

This is the one clearly identified, code-evidenced race condition in the
codebase, and it is squarely in the Live Queue domain — **not** in
Appointments (which has no create/booking endpoint at all to race on).

**`POST /queue/call-next`** — concrete scenario:

1. Two staff members viewing the same department's waiting list (e.g. one
   on `/d/live-queue`, one on `/w/queue`) each poll `GET /queue/entries`
   every 5s (`hooks/use-queue.ts:31`).
2. Patient ticket "A-014" is at the top of both lists.
3. Both click "Call" within the same polling window, before either client
   has seen the other's change.
4. In the mock, `promoteNext()` (`lib/mock/queue.ts:51-71`) does:
   ```ts
   const target = entryId
     ? entries.find(e => e.id === entryId && e.status === "waiting")
     : entries.filter(e => e.departmentId === departmentId && e.status === "waiting")
              .sort(compareWaiting)[0];
   if (!target) return; // silent no-op — the mutation still resolves as "success"
   ```
   This only behaves correctly because JS is single-threaded over one
   shared in-memory array — the second call's `find`/`filter` simply
   returns nothing, and the function no-ops. **The caller gets no error
   and no signal that nothing happened.**

**Why this must be atomic server-side**: a real concurrent HTTP backend
has no equivalent implicit serialization. Two simultaneous
`POST /queue/call-next` requests (same `entryId`, or both omitting
`entryId` and independently computing "top of queue") could both read
`status = waiting` before either writes, and both proceed — double-
assigning a patient, or silently skipping a different waiting patient.

**Required backend behavior**:
1. The read-check-write (`find target where status='waiting' [and id=?]`,
   then transition to `in_consultation`) must be one atomic operation —
   e.g. `UPDATE ... WHERE id = ? AND status = 'waiting'` with row locking
   or optimistic concurrency, inside a transaction.
2. Unlike the mock's silent `void` return, the real endpoint should
   return a meaningful response (e.g. `409 Conflict`, or the entry
   actually called) so a losing client can show "already called by
   someone else" — the current `Promise<void>` contract cannot express
   this and should be extended.
3. `PATCH /queue/entries/{id}` (Complete/No-show/Skip) has the same
   unvalidated-transition gap: `setStatus()` never checks the entry's
   current status before overwriting it, so two concurrent PATCHes with
   different target statuses is last-write-wins. The backend should
   validate legal transitions (`waiting → skipped`,
   `in_consultation → {completed, no_show}`) and reject illegal ones.

The `entryId`-omitted path ("Call next" — pick top of department's sorted
waiting list) needs "pick top + lock it" to be one atomic operation too,
not a separate SELECT-then-UPDATE without a DB lock.

### 4.4 Soft-delete / archive vs. hard delete — per domain

| Domain | Delete endpoint? | Behavior |
|---|---|---|
| Departments | `DELETE /departments/{id}` | **Hard delete**, unconditional (`store.filter(...)`). Client-side gate only (`canDelete`, §4.4.1) — mock enforces nothing. **Recommend the backend re-enforce this guard server-side (409 on violation).** |
| Appointments | none | "Deletion" is modeled as the terminal status `cancelled` via `PATCH` (§4.1), never a row delete. |
| Patients | none | No delete/archive of any kind exists. |
| Staff | none | "Deactivation" is a soft `accountStatus` field flip via the generic `PATCH /staff/{id}` (§4.6) — never a row delete. |
| Notifications | none | No delete/dismiss endpoint. |
| Settings invites | `DELETE /settings/invites/{id}` | Hard delete of the invite record only; never touches a `StaffMember`. |
| Settings sessions | `DELETE /settings/sessions/{id}`, `DELETE /settings/sessions` | Hard delete of session record(s). Mock comment for "sign out all" says "keep current session marker" but the code actually empties the array including current (`lib/mock/settings.ts:178-183`) — **comment and implementation disagree; confirm intended behavior before building.** |

**4.4.1 — Department `canDelete` gate** (`lib/department-utils.ts`,
UI-only today):
```ts
export function canDelete(d: Department): boolean {
  return d.waiting === 0 && d.inConsultation === 0 && d.appointmentsToday === 0;
}
```
Exactly these three conditions — `doctorsOnDuty`/`totalDoctors` are not
part of the gate. Archiving (`status: "archived"` via `PATCH`) is the
UI's alternative when this gate fails — a soft path with no such
restriction.

Closing or archiving a department also has a **mutation side effect** in
the mock (`applyUpdate`, `lib/mock/departments.ts:154-168`): setting
`status` to `"closed"` or `"archived"` forcibly zeroes `doctorsOnDuty`,
`waiting`, and `inConsultation` on that record. Reopening
(`status: "active"`) does **not** restore `doctorsOnDuty`.

### 4.5 "Capture and show, never advise" — clinical/analytical scope constraint

This is a **repeated, explicit, normative constraint** across two
domains, not incidental phrasing:

- `lib/types/patients.ts:2-7`: *"Record-keeping only... must never
  interpret [clinical data] — it must never interpret it. No
  abnormal-vital flagging, no drug-interaction/allergy warnings, no
  triage or dosage suggestions, no risk scoring. That keeps Pulse out of
  medical-device classification."* Repeated inline at
  `app/(dashboard)/d/patients/[id]/page.tsx:3`,
  `components/dashboard/patients/vitals-dialog.tsx:20-21`,
  `components/dashboard/patients/clinical-record-dialog.tsx:24-26`.
- `lib/types/analytics.ts:4-6`: *"Descriptive only: counts, averages,
  trends. No forecasting, no anomaly flagging, no recommended actions, no
  risk scoring."*

**Concrete implications for the backend**:
- `POST /patients/{id}/vitals` must store-and-return the reading as-is —
  no range-checking, no "abnormal" flags, no alerting on the value.
- Vitals are **not versioned** in the current model — `latestVitals` is a
  single embedded object, and each new recording **overwrites** the
  previous one (confirmed by UI copy in `vitals-dialog.tsx:67-69`: *"Logs
  a new reading with the current time. Replaces what shows as 'latest' —
  earlier readings aren't kept on this view."*). Whether production wants
  a real audit-trail table underneath this "latest" projection is an
  open question (§7.3), not something to assume.
- `GET /analytics` must return descriptive rollups only — no predictive
  fields, no derived "recommended action" fields — matching
  `FacilityAnalytics`/`DepartmentAnalytics` exactly as specified in §2.10.
- No drug-interaction or allergy cross-checking should be built into
  `PATCH /patients/{id}/clinical-record`, even though it would be a
  natural feature — it is explicitly out of scope by design.

### 4.6 Staff duty & account status

- **On creation** (`createStaff`, `lib/mock/staff.ts:75-83`): every new
  staff member starts `dutyStatus: "on_duty"` unconditionally —
  `CreateStaffInput` has no `dutyStatus` field, so there's no way to
  create an `off_duty`/`on_leave` member directly.
- **Duty transitions** thereafter are unrestricted field patches via
  `PATCH /staff/{id}` with `{ dutyStatus }` — no transition validation,
  no timestamps/audit recorded. Driven from a 3-way toggle
  (`on_duty`/`off_duty`/`on_leave`) on the staff detail page.
- **Overnight shifts are valid and expected**: seed data includes
  `shiftStart: "19:00", shiftEnd: "07:00"` — confirming `shiftEnd <
  shiftStart` is a normal state, not an error. No min/max duration or
  `shiftStart !== shiftEnd` check exists anywhere.
- **Account activation/deactivation is a soft flag change, not a
  deletion, and not a distinct endpoint** —
  `updateStaff.mutate({ id, accountStatus: "deactivated" | "active" })`
  goes through the exact same generic `PATCH /staff/{id}` used for every
  other field edit (`components/dashboard/settings/team-access-section.tsx:36-39`).
  No other fields are touched or cleared on deactivation, and the record
  remains fully in the list. `accountStatus` is `undefined ⇒ "active"`
  (helper: `accountStatusOf(member) ?? "active"`).
- **This mechanism is disconnected from the "Danger zone" self-service
  request flow** (`POST /settings/account-request`, §2.8) — that flow
  only ever writes a global `AccountRequest{type,status}` record and
  **never** flips any `StaffMember.accountStatus` in the mock. If
  production wants a request-then-admin-approves-then-deactivates
  pipeline, that state machine must be designed fresh; the two systems
  are entirely unlinked in the reference implementation.
- **Invite → staff account is also unlinked**: `POST /settings/invites`
  creates a `RoleInvite` row in a completely separate list; no code path
  anywhere converts an invite into a `StaffMember`. The `/(auth)/activate`
  page (OTP verify → set password) makes **zero API calls** — it's a
  pure UI-state stub with hardcoded invite email/name constants and a
  comment noting the real token would come from a query param. **Invite
  acceptance, OTP verification, and password-set have no defined
  contract anywhere in this codebase** — must be designed from scratch
  (§7.4).

### 4.7 Analytics aggregation rules (what the mock actually computes)

Unlike Dashboard (pure static literals, §4.8), Analytics has real
aggregation logic worth replicating faithfully — `lib/mock/analytics.ts`:

- `aggregateDaily(rows, from, to)`: buckets by date (inclusive range),
  sums `appointments`/`walkIns`/`served`/`noShows` across departments per
  day; `patientVolume = appointments + walkIns`; `avgWaitMinutes` /
  `p90WaitMinutes` = **rounded average of departments' daily values**
  (unweighted, not volume-weighted); `noShowRate = noShows/appointments*100`.
- `summarize(daily)` → `AnalyticsTotals`: `patientVolume`/`served` summed;
  `avgWaitMinutes`/`p90WaitMinutes` = **average of daily averages**
  (again unweighted); `noShowRate` recomputed from summed
  noShows/appointments.
- `previousRange(from, to)`: previous period of **equal length**
  immediately preceding `from` (`days = round((to-from)/86400000)+1`).
- `utilization` per department: `min(100, round(served / (capacityPerDay
  × days) × 100))` — clamped at 100, numerator is **served** (queue
  throughput), not booked appointments.
- `appointmentsByStatus` is **explicitly fabricated**, not derived from
  real per-appointment status records (mock comment: *"Modeled rather
  than pulled from lib/mock/appointments.ts... Splits the period's total
  appointments across plausible outcome buckets"*): `completed = 78%` of
  total, `cancelled = 6%`, `noShow` = actual no-show count from the
  series, remainder split `60%` confirmed / `40%` scheduled. **These
  ratios are placeholder math, not a business rule to replicate** — the
  real backend must aggregate genuine status counts from real
  appointment records instead.
- **The unweighted-average approach for wait-time metrics is a known
  mock simplification**, not a faithful spec — a real backend with
  per-visit records should decide whether `avgWaitMinutes`/`p90WaitMinutes`
  ought to be true volume-weighted means / real percentiles instead
  (§7.8).

### 4.8 Dashboard — no aggregation exists yet

All six `lib/mock/dashboard.ts` sources (`mockStats`, `mockQueue`,
`mockAlerts`, `mockVolume`, `mockFacility`, `mockUser`) are **hardcoded
literals with zero derivation logic** and no referential integrity to
each other (e.g. `patients-in-queue: "24"` does not equal the sum of
`mockQueue`'s `waiting` counts, `27`). `QueueSeverity` per row is a
hand-set literal, not threshold-derived. **The backend must invent this
aggregation logic from scratch** — there is nothing here to extract
beyond field shapes (§7.8).

---

## 5. Auth & access

### 5.1 What the frontend expects to send/receive

- Every request: `Authorization: Bearer <token>` where the token is
  opaque to the frontend (`lib/axios.ts:14-17`) — no assumption about JWT
  vs. opaque token is encoded beyond the header name.
- On `401`, the frontend is *intended* to clear session state and
  redirect to `/login` (currently commented-out placeholder,
  `lib/axios.ts:24-27`) — **there is no `/login` page in the codebase
  today** (confirmed: no `app/**/login/**` route exists). This must be
  built; the frontend gives no route/form contract for it.
- **No `lib/api/auth.ts` exists.** No login, logout, token-refresh, or
  register function is defined anywhere. The backend's login/refresh
  contract is entirely undefined by this frontend and must be designed
  fresh, informed only by the fact that the result is expected to land in
  `localStorage["pulse_token"]` as a bearer token.

### 5.2 RBAC — enforced by Spring Boot only, never the frontend

This is stated explicitly and repeatedly in the source, not inferred:

- `lib/types/settings.ts:6-10`: *"nothing in this module is enforced
  client-side. Team & Access stores role/permission data via the mock so
  it can be viewed and edited, but Pulse does not gate routes or actions
  on it — enforcement belongs to Spring Boot RBAC."*
- `components/dashboard/settings/permission-matrix.tsx:45-51`: *"This
  matrix is not enforced by the app — it's a record of intended access.
  Applies once backend RBAC is live."*
- `components/dashboard/settings/two-factor-card.tsx`: *"Enforcement is
  applied by the backend."*
- No `middleware.ts` exists anywhere in the app — `/d/**` and `/w/**` are
  not gated by any client-side role check today.

**Roles**: `StaffRole` (§2.6) has 5 values — `admin`, `doctor`, `nurse`,
`front-desk`, `read-only`. These double as both job title vocabulary and
access-control role (single source of truth, per the type's own
comment). The permission matrix (§2.8 table) defines, per resource, what
each role may do (`none`/`view`/`edit`) across 7 resources: Departments,
Live Queue, Appointments, Patients, Staff & Doctors, Analytics, Settings.

Separately, `WorkspaceSession.role` (`SessionRole`, §2.1) is only
`"admin" | "doctor"` — the two values that currently determine `/d` vs
`/w` app routing. The other three `StaffRole` values (`nurse`,
`front-desk`, `read-only`) exist in the permission model but have **no
corresponding workspace/route** built in the frontend yet — confirm with
the team whether nurse/front-desk/read-only users get their own future
`/‹something›` app or are meant to use `/d` or `/w` with restricted
permissions.

**What "enforced by the backend" must mean concretely**:
1. Every endpoint in §3 must independently authorize the caller's role
   against the resource being touched, per the permission matrix (or a
   real equivalent) — the frontend sends requests with zero client-side
   gating today.
2. 2FA: `TwoFactorState{enabled}` is a bare boolean with no OTP/secret/QR
   provisioning anywhere in the frontend (§7.7) — the actual second-factor
   challenge (login-time verification) must be designed and enforced
   entirely server-side.
3. Deletion/deactivation requests (`AccountRequest`, §2.8): the frontend
   only ever submits a `pending` request and displays UI copy promising
   *"reviewed by the backend team"* / *"held for 90 days before permanent
   removal"* (`components/dashboard/settings/danger-zone-card.tsx:52,102-105,138`)
   — the actual review workflow, lock-pending-review behavior, and
   90-day purge job are 100% backend-owned; nothing in the frontend
   implements or schedules any of it.
4. The "sole admin can't deactivate themselves" check
   (`danger-zone-card.tsx` `isSoleAdmin`) is applied **only** to the
   self-service danger-zone flow — the Team & Access per-row deactivate
   toggle (§4.6) has **no such guard client-side**. The backend should
   not assume this protection exists anywhere except where explicitly
   built here — enforce last-admin protection server-side for both paths.

### 5.3 Data retention (90-day language)

The **only** retention-policy text anywhere in the repository is in
`components/dashboard/settings/danger-zone-card.tsx`:
- Line 52: *"Under the facility data-retention policy, account data is
  held for 90 days before permanent removal — no data is deleted
  immediately."*
- Lines 102-105: *"No data is deleted or altered immediately — actual
  enforcement and retention live in Spring Boot under the facility's data
  policy."*
- Line 138: *"Data retained 90 days under facility policy before
  removal."*

A repo-wide search found **zero occurrences** of "DPC", "Data
Protection", or any named regulation anywhere in code or comments — the
90-day figure is generic "facility policy" copy with no cited legal
source. (Ghana's Data Protection Act, 2012, Act 843 is presumably the
intended authority per project context, but it is not referenced
anywhere in this codebase — cite it in the backend implementation from
external/legal guidance, not from source here.) No retention scope
(which tables/fields), no purge-job schedule, and no mock implementation
of the 90-day timer exist anywhere — `submitAccountRequest` only ever
sets `status: "pending"` with no expiry logic.

---

## 6. Non-obvious requirements

### 6.1 Pagination — currently entirely client-side; flag for server-side work

**Every GET list endpoint in the app returns its full collection, every
time, with no page/limit/cursor/since parameter anywhere in `lib/api/*`.**
All filtering, search, sort, and scoping happens in React state /
`useMemo` over the complete result set:

- Patients: `GET /patients` returns everything; scope ("here today"),
  department, gender, and `?q=` search are all client-side filters
  (`app/(dashboard)/d/patients/page.tsx:41-51`).
- Staff: same pattern — department/role filters and `matchesSearch` all
  client-side (`app/(dashboard)/d/staff/page.tsx:43-52`).
- Departments, Notifications, Settings invites, Queue entries: same —
  no server-side filter/paginate anywhere.
- Analytics: the one endpoint that does take real query params
  (`from`/`to`), but still returns the entire nested payload (every day ×
  every department) in one call by design (§3.9).

This works for the current mock dataset sizes (tens of records) but
**will not scale** — flag every list endpoint above as a candidate for
real server-side pagination/filtering/search once record counts grow
beyond a small facility's dataset. The frontend gives no signal on
expected page sizes or cursor shape; this needs fresh design.

### 6.2 Polling cadences (real-time expectations, from `refetchInterval`)

| Resource | Interval | Source |
|---|---|---|
| Live Queue entries (`GET /queue/entries`) | **5s** | `hooks/use-queue.ts:31` — fastest-polling resource in the app |
| Live Queue departments (`GET /queue/departments`) | 10s | `hooks/use-queue.ts:22` |
| Dashboard department queue (`GET /dashboard/queue`) | 10s | `hooks/use-dashboard.ts:34` |
| Departments list/stats (`GET /departments`, `/departments/stats`) | 10s | `hooks/use-departments.ts` |
| Appointments list/stats (`GET /appointments`, `/appointments/stats`) | 30s | `hooks/use-appointments.ts` |
| Patients (`GET /patients`) | 15s | `hooks/use-patients.ts:23` — *"meant to feel live, same cadence as the live queue"* |
| Notifications (list + unread-count) | 30s | `hooks/use-notifications.ts:14` — comment: *"real app will switch to SSE; hook stays the single point"* |
| Staff (`GET /staff`) | none (staleTime 60s only) | `hooks/use-staff.ts` |
| Departments (via `useAppointmentDepartments`) | none (staleTime 5min) | `hooks/use-appointments.ts` |
| Dashboard stats/alerts/volume/facility/user | none | `hooks/use-dashboard.ts` |
| Analytics | none (range-keyed cache) | `hooks/use-analytics.ts` |
| Settings (all) | none | `hooks/use-settings.ts` |

**Everything is plain REST polling — there is no WebSocket, SSE, or push
mechanism implemented anywhere.** Two separate comments (`lib/api/notifications.ts:2`,
`hooks/use-notifications.ts:14`) flag SSE as a likely *future* evolution
for notifications specifically, but today the backend only needs to
support cheap, frequent REST polling — most aggressively 5s on
`/queue/entries`. Mutations broadly `invalidateQueries` on their entire
domain key (e.g. any queue mutation invalidates **both**
`/queue/departments` and every `/queue/entries` variant), causing
out-of-band refetches on top of interval polling — the backend should
expect read amplification beyond the raw interval math suggests.

### 6.3 Image upload — no real contract exists; must be designed fresh

`components/ui/image-upload.tsx` is explicitly mock-only (JSDoc,
lines 20-27): *"Image picker that returns a local object URL for
immediate preview. MOCK behaviour: onChange gives the object URL — it is
NOT persisted to a server... real upload wiring comes later."* It never
sends `FormData` or any HTTP request — only `URL.createObjectURL(file)`.
Client-side validation only: `image/*` MIME check, 5MB default max size.

Used for three fields, **none of which have a corresponding upload
endpoint anywhere in `lib/api/*`**:
- `FacilityProfile.logoUrl` (Settings → Facility)
- `AdminProfile.avatarUrl` (Settings → Profile / `/d/profile`)
- `StaffMember.avatarUrl` (staff domain, `/w/profile` and staff detail)

**Contract to design fresh**: the backend needs a real upload endpoint
(likely multipart `POST`, returning a persisted URL) that the entity then
stores as a plain string URL — the frontend's expectation (confirmed by
every `avatarUrl?: string` / `logoUrl?: string` field shape) is that
**the entity stores a URL only**, never binary data, matching the "image
upload returns a URL" pattern requested. No method, path, or response
shape is specified anywhere in the frontend to extract.

### 6.4 Idempotency

- `POST /queue/call-next`: **not idempotent by design intent** (each call
  should promote exactly one different entry) but the mock's silent
  no-op-on-conflict behavior (§4.3) means retries are *currently* safe
  from the client's perspective (a retry either promotes the same
  already-in-progress state or no-ops) — however this relies entirely on
  the race-condition fix in §4.3; without atomic server-side handling, a
  retried call after a timeout could double-promote. **Recommend an
  idempotency key or returning the already-called entry on retry** once
  atomicity is added, since the current `void` response gives the client
  no way to distinguish "my call succeeded" from "someone else's call
  succeeded first."
- `POST /patients`, `POST /staff`, `POST /departments`: no idempotency
  key or duplicate-detection exists in the mock (e.g. `createInvite` has
  no re-invite/duplicate-email dedupe check, `lib/mock/settings.ts:253-263`).
  Standard create semantics (client retries risk duplicate rows) — not
  flagged as solved anywhere in the frontend.
- `PATCH` endpoints are naturally idempotent (shallow field patches) with
  one exception: `PATCH /patients/{id}/clinical-record` replaces whole
  arrays (`allergies`, `currentMedications`) rather than appending —
  sending the same patch twice is safe/idempotent, but a client
  reconstructing "add one allergy" from a stale list and re-sending could
  silently drop concurrent edits (lost-update problem — no optimistic
  concurrency/ETag mechanism exists anywhere in the frontend for any PATCH
  endpoint in the whole app).

---

## 7. Open questions / decisions still needed

Consolidated across all domains — items the frontend assumes, hints at,
or is simply silent on, that the backend team must resolve before or
during implementation. Cross-referenced to the sections above.

### 7.1 Missing create/check-in endpoints (biggest structural gap)

- **No `POST /appointments` (create/book) exists anywhere.** The
  frontend has no booking form, no `CreateAppointmentInput` type, no API
  function. "Auto-confirm booking" and "slot validation" cannot be
  extracted because the booking flow itself isn't built in the frontend
  yet — these must be designed fresh. The only extractable fact is the
  status vocabulary and legal transitions (§4.1), which imply booking
  should *not* auto-confirm (confirm is a distinct, explicit action).
- **No `POST /queue/entries` (check-in / walk-in registration) exists
  anywhere.** Same gap — the queue's `waiting` state is only ever seed
  data in the mock; nothing creates a `QueueEntry`.
- **The "checked_in → hand off to Live Queue" comment
  (`lib/appointment-utils.ts:41`) has no implementing code** — no call
  site anywhere creates a `QueueEntry` when an appointment transitions to
  `checked_in`. Confirm whether check-in should synchronously create a
  queue entry (and if so, populate `patientId`, `priority`, `source:
  "appointment"` from the appointment) as part of `PATCH
  /appointments/{id}` with `status: "checked_in"`, or via a separate
  explicit call.
- `CallNextInput` has no acting-clinician field — the backend must derive
  the calling staff member from the authenticated session, not the
  request body.

### 7.2 Department capacity model & the three unsynchronized department lists

- Confirm whether `Department.doctorsOnDuty`/`waiting`/`inConsultation`/
  `avgWaitMinutes`/`appointmentsToday` should be **derived live** from
  Queue/Appointment/Staff tables (most plausible, given they're absent
  from `UpdateDepartmentInput`) or stored as directly-editable columns
  (current mock shape, but with no client path to edit most of them).
- **Three separate, unsynchronized department representations exist**:
  full `Department` (6 entities: cardiology, pediatrics, emergency,
  general-medicine, maternity, laboratory) vs. `AppointmentDepartment`
  (4 entities, missing maternity/laboratory) vs. Queue's `{id,name,room}`
  (same 4, plus a `room` field) vs. Analytics' own hardcoded 6-department
  fixture with `capacityPerDay`. Decide whether to unify into one
  `department` table referenced by FK from Appointment/QueueEntry/
  Analytics, or keep them intentionally denormalized as the frontend
  mocks do (and if so, make maternity/laboratory selectable for
  appointments/queue, which is currently impossible).
- `capacityPerDay` (drives Analytics `utilization`, §4.7) has no source
  anywhere outside the Analytics mock's own fixture — decide whether it
  belongs on the `Department` entity itself.
- Should `DELETE /departments/{id}` re-enforce the `canDelete` gate
  server-side (409 on violation), given the mock has zero server-side
  protection?
- Should staff-to-department linkage (`StaffMember.departmentId`) drive
  `totalDoctors`/`doctorsOnDuty` computation? Today they're completely
  decoupled — assigning/removing staff via `ManageStaffDialog` never
  updates the department's capacity numbers in the mock.
- `DepartmentStats.rooms` sums rooms across **all** departments
  regardless of status, while `doctorsOnDuty`/`waiting` only sum active
  ones — confirm this asymmetry is intentional.

### 7.3 Patients: vitals history, clinical-record field-name bug, currentVisit ownership

- **Real bug found**: `ClinicalRecordDialog`'s `onSubmit` emits a field
  called `medications`, but `UpdateClinicalRecordInput` (and the PATCH
  body) expects `currentMedications`
  (`components/dashboard/patients/clinical-record-dialog.tsx:39,65-71`
  vs. `lib/types/patients.ts`). As currently wired, medication edits from
  this dialog **do not actually reach the `currentMedications` field** —
  only allergies round-trip correctly. Confirm the correct field name
  with the frontend team before building the endpoint's request DTO (or
  fix the frontend bug first).
- Vitals have **no history** — `latestVitals` is a single overwritten
  snapshot by design (per UI copy, §4.5). Confirm whether production
  wants zero audit trail (matches frontend today) or a `vitals` table
  with a "latest" view underneath (bigger schema decision).
- `currentVisit` is **entirely read-only** from the Patients domain — no
  patient mutation ever sets/clears it, and it's absent from both
  `CreatePatientInput` and `UpdatePatientInput`. Which service (Queue?
  Appointments?) owns writing it, and does `GET /patients` need to
  join/project it live, or is it denormalized and updated by queue-domain
  writes? Not resolvable from the Patients domain alone.
- `GET /patients/{id}` is defined but never called (frontend derives from
  the list cache) — keep it for future/non-JS use, or deprioritize?
- Patient number format (`PT-` + 5-digit zero-padded, monotonically
  increasing) is extractable as a *format* requirement, but the mock's
  max-scan-and-increment generation is not concurrency-safe — the backend
  must guarantee uniqueness independently (DB sequence/unique
  constraint), not replicate the mock's algorithm.

### 7.4 Staff: invite/activation/onboarding flows are non-functional stubs

- `/(auth)/activate` (OTP verify → set password) makes **zero API
  calls** — hardcoded invite email/name, "any 6-digit code passes,"
  no password-set request. No token-based invite lookup exists.
- `/(auth)/onboarding/admin` (initial admin registration) has an explicit
  `// TODO: create account, then router.push("/dashboard")` — it collects
  a full form (name, email, password, plus all onboarding facility data)
  and does `console.log(payload)` only. **No registration endpoint is
  called or defined anywhere.**
- `RoleInvite` and `StaffMember` are structurally unlinked — no field
  joins them, no code converts an accepted invite into a staff account.
  All of: what fields an accepted invite should seed on the new
  `StaffMember` (department? shift times? none of these are collected by
  the invite form), how OTP verification actually works, and how a
  password gets set, must be designed from scratch — the frontend
  provides UI shape and copy intent only, not a contract.
- Should `PATCH /staff/{id}` reject edits to a `deactivated` account (or
  reject `dutyStatus` changes while deactivated)? Not specified anywhere.
- Should `departmentName` be trusted from the client on `POST`/`PATCH
  /staff`, or always derived server-side from `departmentId`? The mock
  trusts the client-sent value as-is.

### 7.5 Notifications: trigger logic entirely unspecified

- **No creation/trigger code exists anywhere** — the mock only ever
  mutates read state on static seed data. What events fire a notification
  (no-show detected? queue-severity threshold crossed? which threshold —
  cross-reference `OperationalSettings.queuePriorityLevels`/
  `queueRefreshSeconds`?), for whom (global facility feed, or per-user/
  role-scoped?), and how title/body text is generated are all
  undetermined by the frontend and need product input.
- No pagination/cursor/expiry/archiving exists — is the full history
  always returned, and does it ever get capped or purged?
- Confirm whether `markRead`/`markAllRead` should keep returning the
  **full notification list** (current mock behavior) or a leaner
  response (204, or just the mutated item), relying on the frontend's
  existing query-invalidation-triggered refetch either way.
- No severity/priority field exists — if product wants to distinguish
  "critical" vs. "informational" notifications beyond the `type` enum,
  that's a net-new field requiring explicit design.

### 7.6 Settings: retention citation, image contract, numeric-as-string fields

- The specific legal citation for the 90-day retention policy (Ghana DPC
  Act 843) does not appear anywhere in the codebase (§5.3) — source it
  from product/legal, not this frontend.
- `SubmitAccountRequestInput.transferOwnershipTo` is defined in the type
  but **never read** by the mock and **never populated** by any UI form
  field — its actual invocation path/UX is unclear; confirm before
  building.
- `FacilityProfile.capacity` and `.duration` are typed as `string`, not
  `number`, despite being numeric form inputs — decide whether the real
  DTO should coerce to numeric types or preserve string typing to match
  the frontend exactly (breaking change either way if mismatched).
- Image upload (§6.3) needs a full contract designed from nothing.
- `facility.logoUrl` is absent from the mock seed even though the type
  and form both support it — just a mock-data gap, not a contract issue.

### 7.7 2FA: no OTP/verification flow anywhere

`TwoFactorState` is a bare `{ enabled: boolean }`. No secret
provisioning, QR code, backup codes, or verification-step type/endpoint
exists anywhere in types, mock, or UI — copy simply states "Enforcement
is applied by the backend." The entire second-factor challenge mechanism
(setup flow, login-time challenge, recovery codes) must be designed fresh
for Spring Boot; nothing here is extractable beyond "there's a boolean
toggle the UI expects to flip."

### 7.8 Dashboard/Analytics: identity mismatches & aggregation to build from scratch

- `CurrentUser` (`GET /auth/me`, `{id,name,role}`) and `WorkspaceSession`
  (§2.1, richer shape) represent "the logged-in user" with **different
  field sets and different literal IDs** in their mock fixtures
  (`"user-admin"` vs. `"staff-admin"`) despite a code comment claiming
  they're the same identity. Decide whether `/auth/me` should return the
  narrow shape as-is or be unified with `WorkspaceSession`.
- `DepartmentQueue` (Dashboard, §2.9) and `QueueDepartment` (Live Queue,
  §2.4) model the same concept with different field names and zero
  shared backing data in the mock. Decide whether `/dashboard/queue`
  should be retired in favor of the admin overview widget consuming
  `/queue/departments` directly, or whether these are intentionally
  distinct resources.
- No threshold rule exists anywhere for `QueueSeverity` on the Dashboard
  side (hand-set literal per mock row) — unlike Live Queue's explicit
  `>40 critical / >25 warning` (§4.2), which the backend should probably
  reuse here too, pending confirmation.
- `mockStats` trend/sentiment values are hardcoded, not derived from any
  period-over-period comparison — decide whether Dashboard should reuse
  the Analytics domain's `computeDelta`-style logic (§4.7) once real data
  exists.
- Every Dashboard aggregate (`patients-in-queue`, `avg-wait-time`,
  `appointments-today`, `no-show-rate`, `mockAlerts`, `mockVolume`) needs
  genuinely new backend aggregation logic — there is no mock-side formula
  to copy, only field shapes (§4.8).
- Analytics' unweighted "average of daily averages" for
  `avgWaitMinutes`/`p90WaitMinutes` (§4.7) is a known simplification —
  confirm whether real per-visit records should instead produce a true
  volume-weighted mean / real p90 percentile.
- `appointmentsByStatus` ratios (78% completed / 6% cancelled / etc.) are
  fabricated placeholder math (§4.7) — must be replaced with real status
  aggregation from actual appointment records.
- Should `/analytics` remain one combined payload (all departments, full
  date range, one call — current design, relied upon for instant
  department-switching client-side) or support narrower/paginated queries
  for larger datasets?
- No facility-scoping parameter exists on any Dashboard or Analytics
  endpoint — implies single-facility scope via auth context, never stated
  explicitly.

### 7.9 Auth (structural, not domain-specific)

- No login/logout/refresh/register endpoint contract exists anywhere in
  the frontend (§5.1) — must be designed fresh, informed only by "result
  lands in `localStorage['pulse_token']` as a bearer token."
- No `/login` page/route exists in the frontend today — needs to be
  built alongside the backend auth endpoints.
- Confirm the error-response envelope for validation/404/auth failures —
  the mock only ever throws generic `Error` objects with no `{code,
  message, field}` structure anywhere in `lib/api/*` or `lib/axios.ts`
  to standardize against.
