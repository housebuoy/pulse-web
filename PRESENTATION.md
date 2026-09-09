# PULSE WEB — Staff & Hospital-Admin Dashboard

**Repo:** `housebuoy/pulse-web` (local checkout at `D:\Projects\pulse\pulse-web`, branch `develop`)
**Live deployment:** https://pulse-web-wheat.vercel.app
**Live API:** https://pulse-o3gj.onrender.com/api (Spring Boot — the real backend this app talks to when mocks are off)
**Scope of this deck:** lecture-prep. Every path below exists in the repo; anything a presenter claims can be opened and verified in code.

**Overview.** Pulse Web is the staff-facing web app of the Pulse demo. It ships **two role-based shells**: `/w` (doctor workspace — queue operations, "my" patients, appointments) and `/d` (hospital-admin dashboard — overview, appointments, patients, departments, staff, analytics, settings, live queue). Staff identities, facilities and RBAC live on the Spring Boot backend; the web app consumes it through a typed API layer that today runs against an in-repo mock behind a single environment flag. Auth is email + password + **per-account OTP 2FA**, demo password `Password123!`.

---

## 1. Stack & how to run it

Verified in `package.json` (name `pulse-dashboard`, next `16.2.9`, react `19.2.4`):

| Layer | What is actually used | Evidence |
|---|---|---|
| Framework | Next.js **App Router** (all routes under `app/`, every screen a `page.tsx`) | full `app/` tree, `next.config.ts` |
| Language | TypeScript 5.x | `tsconfig.json`; all sources `.tsx`/`.ts` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`, CSS-first config) | `package.json`, `postcss.config.mjs`, `app/globals.css` |
| UI kit | **shadcn/ui** primitives in `components/ui/` (23 files: button, dialog, dropdown-menu, input, otp-input, password-input, textarea, tooltip, checkbox, …) on **Radix**, icons **lucide-react** | `components.json` (style `radix-nova`, `ui: "@/components/ui"`), `components/ui/`, deps `radix-ui`, `lucide-react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `tw-animate-css` |
| Server state | **@tanstack/react-query v5 — yes**: `QueryClient` created once per browser session in `app/providers.tsx` (`staleTime 30s`, `refetchOnWindowFocus: false`, no retry on any 4xx, ≤2 retries on network/5xx), Sonner `<Toaster>` for toasts | `app/providers.tsx`, mounted in `app/layout.tsx` |
| HTTP | **axios** singleton `lib/axios.ts` (`api`), baseURL `process.env.NEXT_PUBLIC_API_URL ?? http://localhost:8080/api` | `lib/axios.ts` |
| Forms/schemas | react-hook-form + zod + `@hookform/resolvers` | `package.json` (used in settings sections & form dialogs) |
| Client state | **zustand v5 — but only for the onboarding multi-step store** (`store/use-onboarding-store.ts`, `persist` middleware). Session/auth deliberately does **not** use a store | `store/`, commented-out `useAuthStore` hint in `lib/axios.ts` |
| Charts | recharts v3 | `package.json` (analytics + overview charts) |
| Dates | date-fns v4 | `package.json` |

**Scripts (package.json):** `npm run dev` (next dev) · `npm run build` (next build) · `npm run start` · `npm run lint` (plain `eslint`). **No test script exists.**

**Quality gates used by the team (no CI exists — see Gotchas):**

```bash
npm run dev          # local dev server
npx tsc --noEmit     # type gate (manual)
npm run build        # production build gate (manual)
npm run lint         # eslint (baseline-debt compare, manual)
```

**Mock ↔ real backend.** Every `lib/api/*.ts` module branches on `NEXT_PUBLIC_USE_MOCK !== "false"` at the top of each function. `.env.example` documents it: set `NEXT_PUBLIC_USE_MOCK=false` and `NEXT_PUBLIC_API_URL=<backend>/api`, and the *same* functions hit Spring Boot — components and hooks never change. `lib/api/appointments.ts` opens with the phrase "The swap point."

**Deploy.** Vercel, live at `pulse-web-wheat.vercel.app`. The repo checkout is **not git-linked**: there is no `.vercel/` directory and no `.github/workflows/`, so builds are pushed to Vercel directly (REST CLI) rather than through a GitHub integration. Per `PULSE_PROJECT_SUMMARY.md`, the web stack works on a long-lived `develop` branch with granular conventional commits and one consolidated `develop → main` PR per phase checkpoint; the backend auto-deploys to Render on `main`.

---

## 2. CODE MAP — what kind of code lives where

Route groups are **parallel app shells, not shared chrome**: each group has its own layout that installs its own sidebar and guard, then delegates to shared `components/dashboard/*`.

### 2.1 Route segments and their code types

| Segment | Files (type) | Convention |
|---|---|---|
| `app/layout.tsx`, `app/providers.tsx` | Root layout + QueryClient/Toaster providers (route layer) | `useState(() => new QueryClient(...))` — never a module-level client |
| `app/page.tsx` | Public landing hero (route/page layer, client) | Session present → immediate `router.replace(roleHome(role))`; no flash of hero |
| `app/(auth)/` — `login`, `activate`, `forgot-password`, `new-password`, `onboarding`, `request-access`, `status`, `support`, `legal` (each `page.tsx` under shared `(auth)/layout.tsx`) | Public auth-flow screens (route/page layer). `legal` & `support` are thin viewers over `lib/content/legal.ts` + `lib/content/support.ts`; `status` is a **server component** reading `lib/mock/status.ts` | Content out of the page (`lib/content/`); form widgets out of the page (`components/onboarding/*`, `components/ui/otp-input`); no session dependency — footer links are public on purpose |
| `app/(dashboard)/d/` — `overview`, `live-queue`, `appointments`, `departments` (+`new`, `[id]/edit`), `patients` (+`[id]`), `staff` (+`[id]`), `analytics`, `notifications`, `profile`, `settings` | Admin pages (route/page layer, all client) | Thin pages: compose header + domain components + hooks; `Suspense` around anything reading `useSearchParams` |
| `app/(dashboard)/d/layout.tsx` | Admin shell layout (route layer) | `<RequireRole allow={["admin"]}>` → `<FacilityStatusGate>` → `AppSidebar` |
| `app/(workspace)/w/` — `queue`, `patients` (+`[id]`), `appointments`, `notifications`, `profile`, plus `w/page.tsx` = `redirect("/w/queue")` | Doctor pages (route/page layer, all client) | Same `components/dashboard/*` as `/d`; doctor-scoping done via `useWorkspaceSession().staffId` |
| `app/(workspace)/w/layout.tsx` | Doctor shell layout (route layer) | `<RequireRole allow={["doctor"]}>` + `WorkspaceSidebar`; comment: "the only fork is this shell + scoped pages" |

### 2.2 Layouts, guards & session (route/guard layer)

- `app/layout.tsx` — fonts (`Space_Grotesk`, `Inter` via `next/font/google`), `globals.css`, `<Providers>`.
- `app/(auth)/layout.tsx` — split-screen `BrandPanel` (`components/auth/brand-panel.tsx`) + public footer (Privacy/Terms → `/legal?doc=…`, Trust Center, System Status).
- `components/auth/require-role.tsx` — `RequireRole`: renders `null` until the session resolves (`isResolved`), then redirects to `/login` when no session, or to `roleHome(role)` when the role isn't in `allow` (doctor on `/d`, admin on `/w`). Header comment: front-end guard only, real RBAC is Spring Boot (`BACKEND_SPEC.md`).
- `components/dashboard/facility-status-gate.tsx` — wraps `/d` content: `suspended` → `FacilitySuspendedBlock`; `active_pending_docs` → grace `FacilityStatusBanner` with `hefraDueDate`; dev-only `?facilityStatus=` preview override. Only `/d` is gated.
- `components/dashboard/app-sidebar.tsx` → generic `components/shell/app-sidebar.tsx` (nav items Overview/Live Queue/Appointments/Departments/Staff & Doctors/Patients/Analytics/Settings + facility context label + user card: `/d/profile` link, Log out = `clearSession()` + hard nav to `/login`).
- `components/workspace/workspace-sidebar.tsx` — doctor nav: My Queue `/w/queue`, My Patients `/w/patients`, My Appointments `/w/appointments`, Profile `/w/profile`.
- `hooks/use-workspace-session.ts` — **single session source for both shells**. Reads `localStorage["pulse_token"]`; mock tokens (`mock-session.<staffId>`, 24 h expiry) decode locally via `lib/mock/auth.ts`; a real JWT is opaque so the session is fetched from `GET /auth/me`. Exposes `useAuthState()` → `{ session, isResolved }` and the non-null convenience `useWorkspaceSession()`. The file documents a real hard-refresh bug it fixes: SSR's "no session" default would otherwise make RequireRole redirect authenticated users to `/login` before the client read lands (deliberate `useState`+effect over `useSyncExternalStore`).

### 2.3 Components — per-domain UI (`components/`)

Shared domain UI lives under `components/dashboard/<domain>/`; **both shells import the same folders** — the only /w-specific component is `components/workspace/workspace-sidebar.tsx`.

| Folder | Domain components (verified) | Consumed by |
|---|---|---|
| `dashboard/overview/` | `stat-card.tsx`, `live-queue-card.tsx`, `needs-attention-card.tsx`, `patient-volume-chart.tsx` | `/d/overview` |
| `dashboard/queue/` | **`now-serving-panel.tsx`** (serving cards, Call next, Complete), **`consult-complete-dialog.tsx`**, `queue-list.tsx` (Call/Skip per waiting row), `queue-department-tabs.tsx`, `queue-summary.tsx`, `queue-badges.tsx`, `live-duration.tsx` | `/w/queue`, `/d/live-queue` |
| `dashboard/appointments/` | `appointment-row.tsx`, `appointment-status-badge.tsx`, `appointment-filters.tsx`, `appointment-date-nav.tsx`, `appointment-summary.tsx`, `appointment-block.tsx`, `appointment-list.tsx`, `upcoming-list.tsx`, `week-view.tsx`, `month-view.tsx`, `view-switcher.tsx` | `/d/appointments`, `/w/appointments` |
| `dashboard/patients/` | `patient-table.tsx`, `patient-toolbar.tsx`, `patient-form-dialog.tsx`, `patient-visit-badge.tsx`, `medical-records-section.tsx`, `clinical-record-dialog.tsx`, `vitals-dialog.tsx` | `/d/patients`, `/w/patients`, both `[id]` pages |
| `dashboard/departments/` | `department-list-rail.tsx`, `department-detail.tsx`, `department-form.tsx`, `department-form-dialog.tsx`, `department-status-badge.tsx`, `department-summary.tsx`, `department-actions-menu.tsx`, `delete-department-dialog.tsx`, `adjust-hours-dialog.tsx`, `assign-head-doctor-dialog.tsx`, `manage-staff-dialog.tsx` | `/d/departments` + `[id]/edit` + `new` |
| `dashboard/staff/` | `staff-table.tsx`, `staff-toolbar.tsx`, `staff-form-dialog.tsx`, `staff-status-badge.tsx`, `duty-control.tsx` | `/d/staff`, `staff/[id]`, dept manage-staff |
| `dashboard/analytics/` | `analytics-line-chart.tsx`, `chart-card.tsx`, `date-range-picker.tsx`, `department-breakdown.tsx`, `department-comparison-table.tsx`, `status-breakdown.tsx`, `export-bar.tsx` | `/d/analytics` |
| `dashboard/notifications/` | `notifications-panel.tsx` (bell popover), `notifications-feed.tsx` (full page feed), `help-menu.tsx` (? menu + support links), `keyboard-shortcuts-dialog.tsx` | `dashboard-header.tsx` (both shells), `/d/notifications`, `/w/notifications` |
| `dashboard/settings/` | `settings-tabs.tsx`, `facility-section.tsx`, `profile-section.tsx`, `operational-section.tsx`, `team-access-section.tsx`, `two-factor-card.tsx`, `change-password-dialog.tsx`, `sessions-card.tsx`, `danger-zone-card.tsx`, `invite-user-dialog.tsx`, `role-change-dialog.tsx`, `permission-matrix.tsx`, `preferences-card.tsx`, `notification-preferences-card.tsx`, `password-card.tsx`, `section-save-bar.tsx`, `use-just-saved.ts` | `/d/settings` (all tabs), `/d/profile` & `/w/profile` reuse `ProfileSection` |
| Shared chrome | `dashboard/app-sidebar.tsx`, `dashboard-header.tsx` (title + search + bell + help — used by every page in **both** shells), `global-search.tsx`, `facility-status-gate.tsx`, `facility-status-banner.tsx`, `facility-suspended-block.tsx`, `status-badge.tsx`, `filter-tabs.tsx`, `live-status-indicator.tsx`, `metric-stat.tsx`; `shared/`: `card.tsx`, `stat-bar.tsx`, `stat-tile.tsx`, `user-avatar.tsx` | all `/d` + `/w` pages |
| `auth/`, `onboarding/` (+`steps/departments-step.tsx`, `steps/admin-step.tsx`), `shell/`, `ui/` | Split-screen brand panel, password-strength, require-role; onboarding form widgets + steps; generic sidebar; shadcn primitives | `(auth)` routes; onboarding; layouts; everywhere |

### 2.4 Hooks — the data-fetching layer (`hooks/`)

One hook module per domain, each wrapping a `lib/api/*` module with TanStack Query; **components call hooks, never axios or lib/api directly**.

- `use-queue.ts` — `useQueueDepartments` (10 s poll), `useQueueEntries` (5 s poll), `useCallNext`, `useUpdateQueueStatus`, `useCompleteConsult` (invalidates queue **and** appointments). Exports `queueKeys`.
- `use-appointments.ts` — `useAppointments` (5 s), `useAppointmentStats` (5 s), `useAppointmentDepartments`, `useAppointmentsRange(from, to, options)` (5 s, `placeholderData` keeps previous day's rows), `useUpdateAppointment`, `useUpdatePayment`. Exports `appointmentKeys` (consumed cross-domain by the queue hook).
- `use-patients.ts` / `use-patient-records.ts` — patient list/detail + records: `usePatientRecords`, `useAddVisitNote`, `useAddPrescription` (+ vitals/clinical-record mutations used by detail pages).
- `use-staff.ts`, `use-departments.ts` (CRUD incl. `useDeleteDepartment`), `use-settings.ts` (facility/profile/operational/2FA/sessions/preferences/invites/permissions), `use-analytics.ts`, `use-dashboard.ts` (stats, `useDepartmentQueue` = the one polling overview query, alerts, patient volume, current facility/user), `use-notifications.ts` (30 s poll).
- `use-access-request.ts` — approval gate for `/onboarding` (`approved` + `isResolved`), same shape discipline as `use-workspace-session.ts`.
- `use-workspace-session.ts` — see 2.2.

### 2.5 API boundary, types & domain helpers (`lib/`)

- `lib/api/*.ts` — **one typed API client per domain** (exactly 10 files: `analytics`, `appointments`, `dashboard`, `departments`, `notifications`, `patients`, `queue`, `records`, `settings`, `staff`). Shape of every function: `if (USE_MOCK) return mock…; const { data } = await api.get/post/patch(…)`. Mutations are already shaped to the real Spring Boot endpoints (`POST /queue/entries/{id}/complete`, `PATCH /appointments/{id}/payment`, `GET /patients/{id}/records`, …).
- `lib/axios.ts` — axios instance; **request interceptor** attaches `Authorization: Bearer <localStorage["pulse_token"]>`; **response interceptor** on 401 clears `pulse_token` + `pulse_trusted_device` and hard-navigates to `/login` (unless already there). Note the commented `useAuthStore` import — the store idea was dropped; localStorage read is the implementation.
- `lib/types/*.ts` — per-domain mirrors of the backend contract: `auth`, `queue`, `appointments`, `patients`, `records`, `staff`, `departments`, `analytics`, `settings`, `notifications`, `dashboard`. Comment convention: "Keep in sync with the backend contract so the UI never changes when mock → real." Types are **duplicated, not shared via a package** (backend and mobile repos own their own).
- `lib/mock/*.ts` — in-repo mock stores that mirror API shapes so the app runs with zero backend; mock queue mutations mutate an in-memory list; `mock/auth.ts` seeds the demo sessions and implements the whole 2FA/reset state machine.
- Domain logic helpers (`lib/*-utils.ts`, all verified): `queue-utils.ts` (`compareWaiting`, `minutesSince`), `appointment-utils.ts` (`STATUS_META`, `actionsFor`, `toDateKey`, `addDays`, `isToday`, `countByDepartment`, `matchesSearch`), `patient-utils.ts` (`matchesSearch`, `isHereToday`, `calculateAge`, initials), `staff-utils.ts` (`ROLE_LABEL`, `formatShift`), `department-utils.ts` (`formatHours`, `loadTone`, `canDelete`, `matchesSearch`), `analytics-utils.ts` (`computeDelta`, `presetToRange`, `buildCsv`, `downloadCsv`), `calendar-utils.ts` (`getWeekRange`, `getMonthRange`), plus `lib/utils.ts` (`cn`), `lib/format.ts` (date/time/range-label helpers), `lib/constants.ts`.
- `store/use-onboarding-store.ts` — the one zustand store (localStorage-persisted): operational data + admin-account details carried between `/request-access` and `/onboarding`.

### 2.6 Middleware / proxy / server code

**None.** No `middleware.ts` at root or in `src/`, no rewrites/proxies in `next.config.ts`, no server actions or route handlers — the app is a fully client-rendered SPA talking to the backend (or mock) over axios. All "routing protection" is the client-side `RequireRole` described above; the real gate is Spring Boot RBAC on every endpoint.

### 2.7 Repo root files worth knowing

`AGENTS.md`/`CLAUDE.md` (agent conventions), `PULSE_PROJECT_SUMMARY.md` (cross-project facts: URLs, accounts, cadence — updated 2026-09-09), `BACKEND_SPEC.md` (backend contract, referenced by code comments), `components.json` (shadcn config), `eslint.config.mjs` (flat config), `tsconfig.json`, `next.config.ts`, `.env.example`/`.env.local` (the mock/real switch), `setup.txt`.

### 2.8 File tree at a glance (verified by `ls`/`find` on 2026-09-09)

```text
pulse-web/
├── app/
│   ├── layout.tsx  providers.tsx  page.tsx          # root providers; public landing
│   ├── (auth)/
│   │   ├── layout.tsx                                # BrandPanel split screen + public footer
│   │   ├── activate/  forgot-password/  login/  new-password/
│   │   ├── onboarding/  request-access/  status/  support/  legal/
│   ├── (dashboard)/d/
│   │   ├── layout.tsx                                # RequireRole(admin) + FacilityStatusGate
│   │   ├── overview/  live-queue/  appointments/  patients/([id])/
│   │   ├── departments/  (new/  [id]/edit/)  staff/  ([id])
│   │   ├── analytics/  notifications/  profile/  settings/
│   └── (workspace)/w/
│       ├── layout.tsx                                # RequireRole(doctor) + WorkspaceSidebar
│       ├── page.tsx                                  # redirect("/w/queue")
│       ├── queue/  patients/([id])/  appointments/  notifications/  profile/
├── components/
│   ├── ui/                        # shadcn primitives (23 files)
│   ├── shell/app-sidebar.tsx      # generic collapsible sidebar shell
│   ├── auth/                      # brand-panel, password-strength, require-role
│   ├── onboarding/ (+ steps/)     # form widgets + departments-step / admin-step
│   ├── workspace/workspace-sidebar.tsx
│   └── dashboard/
│       ├── app-sidebar.tsx  dashboard-header.tsx  global-search.tsx
│       ├── facility-status-gate.tsx  facility-status-banner.tsx  facility-suspended-block.tsx
│       ├── overview/  queue/  appointments/  patients/  departments/  staff/
│       ├── analytics/  notifications/  settings/  shared/
│       └── status-badge.tsx  filter-tabs.tsx  live-status-indicator.tsx  metric-stat.tsx
├── hooks/        # 12 use-* modules, one per domain + session + access-request
├── lib/
│   ├── axios.ts  utils.ts  format.ts  constants.ts
│   ├── api/      # analytics, appointments, dashboard, departments, notifications,
│   │             # patients, queue, records, settings, staff
│   ├── mock/     # same domain set + auth, status, access-request
│   ├── types/    # same domain set + auth
│   ├── content/  # legal.ts, support.ts
│   └── *-utils.ts  # queue, appointment, patient, staff, department, analytics, calendar
├── store/use-onboarding-store.ts   # the only zustand store
├── components.json  eslint.config.mjs  next.config.ts  tsconfig.json
├── package.json  package-lock.json  .env.example  .env.local
├── AGENTS.md  CLAUDE.md  README.md  BACKEND_SPEC.md  PULSE_PROJECT_SUMMARY.md  setup.txt
└── public/
```

### 2.9 Real-backend endpoint map (as coded in `lib/api/*` + comments)

Every call goes through the axios `api` (baseURL = `NEXT_PUBLIC_API_URL`, paths already include `/api` context in the env value). Read-only calls resolve from mock by default; the real calls below are what run with `NEXT_PUBLIC_USE_MOCK=false`.

| Endpoint | Function (file) | Purpose |
|---|---|---|
| `POST /auth/login` | `login()` — `lib/mock/auth.ts` | Step 1; returns token (2FA off) or drives OTP |
| `POST /auth/login/verify-otp` | `verifyLoginOtp()` — `lib/mock/auth.ts` | Step 2; exchanges code for the JWT |
| `GET /auth/me` | `fetchSession()` — `lib/mock/auth.ts` | Resolve session for an opaque JWT |
| `POST /auth/password-reset/{request,verify,confirm}` | `lib/mock/auth.ts` | 3-step staff password reset |
| `GET /queue/departments` | `getQueueDepartments()` — `lib/api/queue.ts` | Department queue summaries |
| `GET /queue/entries` | `getQueueEntries()` — `lib/api/queue.ts` | Full queue (client filters active) |
| `POST /queue/call-next` | `callNextPatient()` — `lib/api/queue.ts` | Call next / specific `entryId` |
| `PATCH /queue/entries/{id}` | `updateQueueEntryStatus()` — `lib/api/queue.ts` | `{ status: "skipped" }` etc. |
| `POST /queue/entries/{id}/complete` | `completeQueueEntry()` — `lib/api/queue.ts` | Consult outcome + prescriptions |
| `GET /appointments` (+`?from&to&staffId`) | `lib/api/appointments.ts` | Lists and ranges |
| `GET /appointments/stats` · `/departments` | `lib/api/appointments.ts` | Day stats; department list |
| `PATCH /appointments/{id}` | `updateAppointment()` | Status transitions |
| `PATCH /appointments/{id}/payment` | `updatePayment()` | `{ paymentStatus }` — the Mark-paid path |
| `GET /patients/{id}/records` | `fetchPatientRecords()` — `lib/api/records.ts` | Visit/lab/prescription history |
| `POST /patients/{id}/records/visits` · `/prescriptions` | `lib/api/records.ts` | Add records from the detail page |
| Departments / staff / settings / analytics / dashboard / notifications | `lib/api/departments.ts`, `staff.ts`, `settings.ts`, `analytics.ts`, `dashboard.ts`, `notifications.ts` | Admin CRUD + read models |

---

## 3. FEATURE MAP (with real file pointers)

### 3.1 Role-based shells & the account lifecycle
- **Guards & layouts:** `d/layout.tsx` = admin + facility gate; `w/layout.tsx` = doctor. Both delegate to `components/auth/require-role.tsx`. Web session roles are exactly `"admin" | "doctor"` (`lib/types/auth.ts`) — nurse / front_desk / read_only exist as *staff records* (`lib/types/staff.ts`) but never sign into this web app.
- **Session:** `hooks/use-workspace-session.ts`; `roleHome()` in `lib/mock/auth.ts` (admin → `/d/overview`, otherwise → `/w/queue`); demo sessions `MOCK_ADMIN_SESSION` (Dr. Sarah Jenkins) and `MOCK_DOCTOR_SESSION` (Dr. Owusu) in the same file.
- **Login + 2FA:** `app/(auth)/login/page.tsx`. Two steps: `login({email,password})` then, when the account has 2FA on / device untrusted, step `"otp"` → `verifyLoginOtp(code, email)` → `markDeviceTrusted()` → `finalizeLogin(token)`. Dev backend echoes the code in a **"Dev OTP" toast** (`result.devOtp`, comment references `otp.dev-mode`). Success redirects via `roleHome`.
- **Staff invite/activation:** `/activate` (`app/(auth)/activate/page.tsx`): OTP → set password → done; signs in with `tokenForSession(MOCK_DOCTOR_SESSION)` — the demo's stand-in for an invite token.
- **Facility sign-up:** `/request-access` (`app/(auth)/request-access/page.tsx`): requester === admin; email OTP must succeed before `submitAccessRequest` runs, so an unverified email never reaches the operator queue. `/onboarding` (`app/(auth)/onboarding/page.tsx`) is gated by `useOnboardingApproval` on a mock `?token=` (a clicked approval email), then collects departments + admin account via `components/onboarding/steps/{departments-step,admin-step}.tsx` into `store/use-onboarding-store.ts`.
- **Password reset:** `/forgot-password` → `/new-password`, three functions `requestPasswordReset → verifyResetCode → resetPassword` in `lib/mock/auth.ts`; the verified reset token travels in **sessionStorage** (`pulse_reset_token`) and does not sign you in afterwards.

### 3.2 Queue operations — `/w/queue` (doctor) and `/d/live-queue` (admin)
Page: `app/(workspace)/w/queue/page.tsx` — stat bar ("My Day": appts today, seen, now serving, waiting, longest wait, live 5 s), `NowServingPanel` (this doctor's `in_consultation` entries only), department waiting list with per-row Call / Skip.
- Data: `useQueueEntries(session.departmentId)` **polls 5 s**, `useQueueDepartments()` 10 s; mock and real both filter to active statuses (`waiting | in_consultation`) — duplicated deliberately in `lib/api/queue.ts` so mock == real.
- Actions: **Call next** → `POST /queue/call-next` (`callNextPatient`, department-wide or targeted `entryId`); **Skip** a waiting row → `PATCH /queue/entries/{id}` `{status:"skipped"}`; **Complete** on a serving card → consult dialog. Only **Skip** is offered on waiting rows — the queue `no_show` status exists in `lib/types/queue.ts` but has no web button; no-shows are produced through Appointments (`actionsFor` confirmed → `no_show`).
- Identity discipline: joins on stable **queue entry `id`** and **`clinicianId` == staff id**, with a name fallback only for rows seeded before the fix (comments in `lib/types/queue.ts`, joins in `w/queue/page.tsx` lines 62–72 and `w/patients/page.tsx`).
- Flash-proofing: a `dataSettled` latch (queue page + patients page) keeps stale-cache empty frames from rendering during remount refetch; skeletons instead.
- `/d/live-queue` (`app/(dashboard)/d/live-queue/page.tsx`): same board components, whole-facility tabs; `canCallNext={!isAllView && waiting.length > 0}`; arrives pre-filtered via `?department=`.

**Consult-complete dialog** — `components/dashboard/queue/consult-complete-dialog.tsx` (+ `now-serving-panel.tsx` for the trigger). Complete button opens it for the serving entry; **the only action on the serving card** (the old No-show action was removed). Form fields: Symptoms (required textarea), Notes/summary (optional), Recommendations (optional), dynamic Prescriptions rows (`{medication, dose, instructions?}`, kept only when medication **and** dose are filled). `key={entry.id}` remounts the form per consultation — no reset effects. Submit → `useCompleteConsult().mutate({entryId, input})` (`hooks/use-queue.ts`) → `lib/api/queue.ts completeQueueEntry` → **`POST /queue/entries/{id}/complete`** → on success invalidates `queueKeys.all` + `appointmentKeys.all` (the backend marks the linked booking completed, which feeds "Previously handled"); toasts surface axios error messages.

### 3.3 "Previously handled" + the 2099 date-range quirk
`app/(workspace)/w/patients/page.tsx`, view `"handled"`: a patient can check in and be served **today against an appointment scheduled later** (the mobile flow does not require the slot to be today), so a completed consult's `scheduledAt` can sit in the future — a today-only query would silently drop it. The fix (documented in-code, lines 37–48): `const HANDLED_TO = "2099-12-31"; useAppointmentsRange("2020-01-01", HANDLED_TO, { staffId: session.staffId })`, then client-side filter `status === "completed"`, keep the latest consult per patient (`Map`), sort by `scheduledAt` desc. Doctor-scoped by **stable `staffId`**, never names. The day view ("My Patients") joins queue entries in `in_consultation` to today's patients.

### 3.4 Dashboard overview (`/d/overview`)
`app/(dashboard)/d/overview/page.tsx`: KPI `StatCard`s, `LiveQueueCard` (per-department severity dots; `useDepartmentQueue`, `refetchInterval: 10_000` in `hooks/use-dashboard.ts`), `NeedsAttentionCard`, `PatientVolumeChart`. Sidebar + facility context label come from `useCurrentFacility`/`useCurrentUser` (`hooks/use-dashboard.ts`).

### 3.5 Appointments — calendar, booking blocks, payment
Pages `/d/appointments` (`app/(dashboard)/d/appointments/page.tsx`) and `/w/appointments` (`app/(workspace)/w/appointments/page.tsx` — same components, every fetch scoped by `session.staffId`).
- Views: **day list / week / month / upcoming** via `view-switcher.tsx` (`useAppointmentView` persists to localStorage); date nav `appointment-date-nav.tsx`.
- Range fetching is view-lazy: week/month `useAppointmentsRange(weekRange.from, weekRange.to, view === "week")` — the boolean is the query's `enabled`, so the day view never pays for unused ranges. Ranges from `lib/calendar-utils.ts`.
- Upcoming view: rolling 12 months from today, filtered client-side to `["scheduled","confirmed","checked_in"]`.
- Booking blocks: `week-view.tsx` (time grid), `month-view.tsx` + `appointment-block.tsx` (day cells), `appointment-list.tsx`/`upcoming-list.tsx`/`appointment-row.tsx`; statuses via `appointment-status-badge.tsx`; badge tones from `STATUS_META` (`lib/appointment-utils.ts`).
- Filters: `appointment-filters.tsx` (department tabs + status), counts via `countByDepartment`.
- Actions per status (`actionsFor`, `lib/appointment-utils.ts`): scheduled → Confirm / Cancel; confirmed → **Check in** / **No-show**; checked_in → Undo (hand-off to Live Queue happens elsewhere; desk can only undo here); completed/cancelled/no_show → terminal, no actions.
- **Mark paid:** `appointment-row.tsx` — `paymentStatus === "paid"` renders the green "Paid" chip, else amber "Unpaid" + an outline **"Mark paid"** button (only when the page passes `onMarkPaid` and the row is unpaid). `onMarkPaid` → `updatePayment.mutate({ id, paymentStatus: "paid" })` → `useUpdatePayment` → `lib/api/appointments.ts updatePayment` → **`PATCH /appointments/{id}/payment`** → invalidates `appointmentKeys.all`. Wired on every view of `/d/appointments` and in `/w/appointments`. Comment in `use-appointments.ts`: fast refresh (5 s) exists because external events — a patient paying via mobile — must surface quickly.

### 3.6 Patients & clinical records
- List: `/d/patients` (`app/(dashboard)/d/patients/page.tsx`) — `PatientToolbar` (scope filters + search via `matchesSearch`/`isHereToday`), `PatientTable`, `PatientFormDialog` (create). `/w/patients` = the doctor's own list + "Previously handled" (3.3).
- Detail: `/d/patients/[id]` and `/w/patients/[id]` share the same record components: `medical-records-section.tsx` (three families — visits, lab results, prescriptions — each with an inline add flow; `useAddVisitNote`/`useAddPrescription`), `clinical-record-dialog.tsx` (record-keeping only: allergies text + current medications; the header comment says it must never flag, score or warn), `vitals-dialog.tsx` (`useRecordVitals`), `patient-visit-badge.tsx`.
- Records plumbing: `hooks/use-patient-records.ts` → `lib/api/records.ts`: `GET /patients/{id}/records` (mock: empty history so the UI is navigable), `POST /patients/{id}/records/visits`, `POST /patients/{id}/records/prescriptions`. Types in `lib/types/records.ts` (`VisitRecord`, `PrescriptionRecord`, `PatientRecords { visits, labResults, prescriptions }`).

### 3.7 Departments admin (`/d/departments`)
`app/(dashboard)/d/departments/page.tsx` + `departments/new` + `departments/[id]/edit`; UI: rail + `department-detail.tsx` (stats, working-hours line via `formatHours`, head doctor, staff list with `StaffStatusBadge`, load tone). CRUD on `hooks/use-departments.ts` → `lib/api/departments.ts`; dialogs: `department-form-dialog.tsx`, **`adjust-hours-dialog.tsx`** (operating hours per department), **`assign-head-doctor-dialog.tsx`** (`useAssignHeadDoctor`), **`manage-staff-dialog.tsx`**, **`delete-department-dialog.tsx`**. Delete guard lives in `lib/department-utils.ts` `canDelete(d)`: true only when `waiting === 0 && inConsultation === 0 && appointmentsToday === 0`; otherwise the dialog routes to Archive (soft status) — `delete-department-dialog.tsx` computes `blocked = !canDelete(department)`.

### 3.8 Staff, roles, invites & access
- `/d/staff`: `app/(dashboard)/d/staff/page.tsx` + `staff/[id]`; `StaffToolbar` (search/role filter), `StaffTable` (role badges via `ROLE_LABEL`), `StaffFormDialog` (create/edit), `StaffStatusBadge`, `duty-control.tsx`. Hooks `useStaff`/`useCreateStaff` + department list for the form.
- Roles: `type StaffRole = "doctor" | "nurse" | "admin" | "front_desk" | "read_only"` (`lib/types/staff.ts`); payloads use enum-safe values mapped through `ROLE_LABEL` — never display strings.
- Team & access (admin): `components/dashboard/settings/team-access-section.tsx` — pending invites list + `InviteUserDialog` + `RoleChangeDialog` + `PermissionMatrix`; hooks `useInvites`/`useCreateInvite`/`useCancelInvite` in `hooks/use-settings.ts`. Invited staff activate through the public `/activate` page.

### 3.9 Analytics (`/d/analytics`)
`app/(dashboard)/d/analytics/page.tsx`: KPI cards → `chart-card.tsx` + `analytics-line-chart.tsx` (daily trend over range), `status-breakdown.tsx`, `department-breakdown.tsx` (per-department metrics with facility-average overlay, incl. no-show rate), `department-comparison-table.tsx`, `date-range-picker.tsx` with presets (`presetToRange`), **CSV export** via `export-bar.tsx` → `buildCsv`/`downloadCsv` (`lib/analytics-utils.ts`, fully client-side). Data: `hooks/use-analytics.ts` → `lib/api/analytics.ts`; `computeDelta` powers up/down arrows.

### 3.10 Settings (`/d/settings`)
`app/(dashboard)/d/settings/page.tsx`, tabs facility / profile / operational / team (`settings-tabs.tsx`, `VALID_TABS` set, tab synced to `?tab=`):
- `facility-section.tsx` — name/logo/region/address/HeFRA, saved with a just-saved state (`use-just-saved.ts`).
- `profile-section.tsx` — personal account (also reused by `/d/profile` and `/w/profile`); `password-card.tsx` + `change-password-dialog.tsx`; `sessions-card.tsx` (active sessions, sign-out-all); **`two-factor-card.tsx`** — per-account 2FA toggle via `useTwoFactor`/`useUpdateTwoFactor`.
- `operational-section.tsx` — queue refresh cadence, appointment slot length, no-show grace minutes, priority-level weights, notification defaults (email/SMS checkboxes) → `useOperational`/`useUpdateOperational`.
- `team-access-section.tsx` — invites, roles, permission matrix (3.8); `danger-zone-card.tsx` for destructive actions.

### 3.11 Notifications, help, keyboard shortcuts, global search
All mounted in the shared **`components/dashboard/dashboard-header.tsx`** (used by every `/d` and `/w` page): `GlobalSearch` (command palette over patients/appointments/staff/departments — pulls the domain hooks and filters with the per-domain `matchesSearch` utils; `Suspense` + `GlobalSearchFallback`), `NotificationsPanel` (bell popover with unread states, `useNotifications`, 30 s poll), `HelpMenu` (support links: mailto, changelog, "report a problem"; opens `KeyboardShortcutsDialog` which documents go-to chords like G→Q queue, G→A appointments). Full pages `/d/notifications` and `/w/notifications` render the shared `NotificationsFeed` (backend feed is owner-scoped and role-agnostic — comment web#11).

### 3.12 Facility status gate
`components/dashboard/facility-status-gate.tsx`: reads `useFacility()`; `suspended` → `FacilitySuspendedBlock`; `active_pending_docs` → `FacilityStatusBanner` with `hefraDueDate`; `?facilityStatus=suspended` dev override for demos. Present only in the `/d` layout.

---

## 4. DISCUSSION QUESTIONS (audience-facing, with answer pointers)

**Shells & routing**
1. *Which layout protects which shell, and how "real" is that protection?* `d/layout.tsx` allows `["admin"]`, `w/layout.tsx` allows `["doctor"]`, both via `components/auth/require-role.tsx`; the guard is **presentational** — Spring Boot enforces RBAC per endpoint (comments in `require-role.tsx`, `w/layout.tsx`). No `middleware.ts` exists.
2. *Why two shells instead of one app with role-switched nav?* Different jobs: `/w` = the doctor's daily ops loop (queue → patients → appointments) with the lean `workspace-sidebar.tsx`; `/d` = facility administration (overview, live-queue, appointments, departments, staff, patients, analytics, settings) with `AppSidebar` + facility-status gate. Everything else is shared `components/dashboard/*`, hooks, lib — only layouts and page scope differ.
3. *Why does an admin hitting `/w/queue` bounce, and where to?* `RequireRole` → `roleHome(role)` (`lib/mock/auth.ts`) → admin `/d/overview`, doctor `/w/queue`; guarded pages render `null` during the redirect so no wrong-chrome flash occurs.
4. *Only two sign-in roles, but five staff roles — why?* Web `SessionRole = "admin" | "doctor"` (`lib/types/auth.ts`); `StaffRole` (nurse/front_desk/read_only) is an admin-managed record enum (`lib/types/staff.ts`). The web app models the two people who actually operate it; backend owns truth.
5. *What is the `isResolved` dance in every guard?* `hooks/use-workspace-session.ts` documents a reproducible hard-refresh bug: an SSR-default "no session" render fired RequireRole's redirect before the client localStorage read landed, so authenticated users were bounced to `/login`. `isResolved` distinguishes "haven't checked yet" from "checked, no session."

**Data-fetching architecture**
6. *How is a fetch layered from click to wire?* Component → hook (`hooks/use-*.ts`) → typed client (`lib/api/*.ts`) → axios `api` (`lib/axios.ts`); request interceptor injects `Authorization: Bearer <localStorage["pulse_token"]>`; 401 responses clear the token and hard-redirect `/login`.
7. *Where does the token live, and what else does the client know?* `localStorage["pulse_token"]` (mock value `mock-session.<staffId>`), with `pulse_token_expires_at` (24 h mock-only expiry) and `pulse_trusted_device`. Reset tokens go to **sessionStorage** (`lib/mock/auth.ts`). Real JWTs are opaque: session is resolved from `GET /auth/me` via `fetchSession`.
8. *Mock vs real — one codebase, two backends?* `NEXT_PUBLIC_USE_MOCK !== "false"` branch inside every `lib/api/*` function; components and hooks never change. `.env.example` documents the flip to `false` + the Render URL.
9. *Why do hooks export query-key namespaces?* Cross-domain invalidation: `useCompleteConsult` (`hooks/use-queue.ts`) invalidates `queueKeys.all` **and** `appointmentKeys.all` because completing a consult marks the linked booking done on the backend.
10. *What is the polling cadence, and why poll at all?* Queue entries 5 s / departments 10 s (`use-queue.ts`); appointments list/stats/range 5 s (`use-appointments.ts`, comment: "external payment/status changes surface within ~5s"); overview live-queue 10 s; patients 15 s; notifications 30 s. No websockets — polling plus mutation-driven invalidation.
11. *Is anything optimistic?* No — mutations invalidate on success, and the QueryClient retries only network/5xx, never 4xx (`app/providers.tsx`). "Live" feel comes from short intervals, not client-side prediction.

**Feature mechanics**
12. *Walk the consult-complete data flow end to end.* Complete button (`now-serving-panel.tsx`) → `ConsultCompleteDialog` (symptoms required; summary/recommendations/prescriptions optional; `key={entry.id}` gives each consultation a clean form) → `useCompleteConsult` → `POST /queue/entries/{id}/complete` with `{symptoms, summary?, recommendations?, prescriptions:[{medication,dose,instructions?}]}` (`lib/api/queue.ts`, types in `lib/types/queue.ts CompleteConsultInput`) → invalidates queue + appointments. The backend writes the clinical records from the same call.
13. *Why does "Previously handled" query to 2099-12-31?* A consult can be served today against a future-scheduled appointment, so a completed row's `scheduledAt` can be in the future. `w/patients/page.tsx` (`HANDLED_TO = "2099-12-31"`, from 2020-01-01) fetches wide and filters `status === "completed"` client-side, latest consult per patient. Before that fix, those completions silently disappeared from the list.
14. *How does the "Mark paid" chip work?* `appointment-row.tsx` reads `paymentStatus`; button → `useUpdatePayment` → `PATCH /appointments/{id}/payment { paymentStatus: "paid" }` (`lib/api/appointments.ts`) → invalidate `appointmentKeys.all`. The 5 s refetch is what surfaces mobile-side payments on the same screen.
15. *Why join queue/patients on clinicianId/staffId rather than names?* Names are mutable; a rename would orphan serving rows and "previously handled" lists. The join falls back to `clinician === session.name` only for rows seeded before the identity fix.
16. *How does the 2FA UX work, per account?* Login returns either a token (2FA off — straight in) or drives the OTP step (2FA on) → `verifyLoginOtp` → `markDeviceTrusted` + `finalizeLogin` (`login/page.tsx`, `lib/mock/auth.ts`). Toggle per account in Settings → `two-factor-card.tsx` (`useUpdateTwoFactor`). Dev backend echoes the code in the "Dev OTP" toast.
17. *Skip vs no-show — what can a desk/doctor actually click?* Only **Skip** on waiting queue rows (`queue-list.tsx`, status `"skipped"`). Queue `no_show` has no web button; appointment `no_show` comes from `actionsFor(confirmed)` on the appointments pages. Terminal statuses have zero actions.
18. *Why can't you hard-delete a busy department?* `canDelete` requires zero waiting / in-consultation / appointments-today (`lib/department-utils.ts`); `delete-department-dialog.tsx` then offers Archive instead.
19. *How do week/month views stay cheap?* Range queries are enabled only when their view is active (`view === "week"` passed as the query `enabled`), and `placeholderData: (prev) => prev` keeps the previous range on screen while the new one loads (`hooks/use-appointments.ts`, `d/appointments/page.tsx`).
20. *Where are loading / empty / error states handled?* A `dataSettled` latch suppresses stale-cache empty flashes on remount (queue + patients pages); skeletons via `isLoading` shimmer (`now-serving-panel.tsx`, `patient-table.tsx`); mutation errors become toasts with `isAxiosError` message extraction (`consult-complete-dialog.tsx`); session expiry is global via the axios interceptor.
21. *What does the facility-status gate actually gate?* Only `/d` (layout-scoped): `suspended` → `FacilitySuspendedBlock`, `active_pending_docs` → HeFRA grace banner, `?facilityStatus=` override for demoing both states (`facility-status-gate.tsx`). `/w` has no gate.
22. *How does global search get data?* `components/dashboard/global-search.tsx` reuses the domain hooks (`usePatients`, `useAppointmentsRange`, `useStaff`, `useDepartments`) and each domain's `matchesSearch` util — no bespoke search endpoint.
23. *What are the quality gates and what is missing?* Manual `npx tsc --noEmit`, `npm run build`, `npm run lint`; no CI workflows, no test script, no lint step in the deploy path.
24. *How does deployment happen without a git link?* No `.vercel/` and no `.github/workflows/` in this checkout → Vercel builds are pushed via the REST CLI against the existing project (`pulse-web-wheat.vercel.app`); GitHub remains the plain source remote (`housebuoy/pulse-web`, branch `develop`).
25. *Types: shared or duplicated?* Duplicated by design — `lib/types/*` mirrors the Spring Boot contract ("keep in sync… so the UI never changes when mock → real"); there is no shared types package and the mobile app keeps its own.

---

## 5. GOTCHAS WORTH TELLING THE AUDIENCE

- **No git-linked deploys.** No `.vercel/` project link and no `.github/workflows/` in the checkout → deploys are pushed to Vercel via the REST CLI; GitHub is source-of-record only. If a build "didn't happen," nothing pushed it.
- **Develop-branch workflow, not trunk.** The checkout is on `develop`; granular conventional commits land there and one consolidated `develop → main` PR closes each phase checkpoint (PULSE_PROJECT_SUMMARY.md). Don't hunt for per-feature branches on `main`.
- **Live API on Render, mocks are the default in this repo.** `NEXT_PUBLIC_USE_MOCK` defaults to mock unless `.env.local` overrides it to `false`; the real Spring Boot API is `https://pulse-o3gj.onrender.com/api`. Seeded demo accounts use `Password123!` (e.g. admin `sarah.jenkins@knust-hospital.test`, KNUST doctor `kelvinquarcoo247@gmail.com`).
- **2FA is per-account and OTP only hits untrusted devices.** Accounts with 2FA enabled get the OTP step; dev mode echoes the code in a "Dev OTP" toast so live demos don't need an inbox (decision comment in `lib/mock/auth.ts`).
- **The 2099-12-31 range hack is load-bearing.** "Previously handled" deliberately queries `2020-01-01 → 2099-12-31` (`w/patients/page.tsx`) because completed consults can be scheduled in the future. It's not a typo — "my completed patients vanished" bugs point here.
- **Empty states can lie during refetch.** TanStack serves stale cache instantly on remount, so queue/patients pages latch (`dataSettled`) before painting "no waiting" / "no previously handled" states — otherwise demos flash empty screens on every navigation.
- **Token storage is localStorage with a 24 h *client-side* mock expiry.** Real session lifetime belongs to the backend JWT; the expiry stamp exists so the demo can show a session going stale. Reset tokens are sessionStorage and are cleared immediately.
- **eslint is a baseline, not a gate.** No CI enforces it; ~13 files carry deliberate `eslint-disable` comments (the session/approval hooks disable `react-hooks/set-state-in-effect` and explain why). Compare against the baseline before "cleaning them up."
- **Front-end role gating is theater by design.** Guards stop wrong-shell flashes; Spring Boot RBAC is the security boundary (state this explicitly if asked "is this secure?").
- **Nurse/front-desk/read-only roles exist in staff admin but can't sign in to this web app** — the session model is admin/doctor; patients use the mobile app.

---

*Sources of truth in-repo: `PULSE_PROJECT_SUMMARY.md` (deployment URLs, demo accounts, cadence — recheck the live state before presenting), `package.json` / `components.json` (stack), `AGENTS.md` / `CLAUDE.md` (workflow conventions), and the source files cited above. If the tree moves between now and the talk, re-verify paths with a quick `ls`/`rg`.*
