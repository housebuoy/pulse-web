# Pulse — Cross-Platform Hospital Booking & Operations Platform

**Project summary & presentation brief** · one file across all three surfaces
_Last updated: 2026-09-09 · Backend main `1e471d3` (PR #62) · Web main == develop `cdd6588` (PR #16) · Mobile develop `c2d0369` (15 ahead of main, checkpoint pending)_

---

## 1. What Pulse is

Pulse is a **multi-surface hospital platform** that connects three planes:

- **Patients** (mobile app): discover approved hospitals, book a department/time slot online, pay with mobile money, get a live queue ticket with a real position, see records/notifications.
- **Doctors & clinical staff** (web workspace): see their own appointments for the day/upcoming, check patients in (hand-off to the live queue), call next, complete visits, read/write clinical records.
- **Admins & front desk** (web dashboard): facility-wide queue board, appointments across all staff, staff & permissions management, operational settings, 2FA/session controls, team invites.

The product goal is a **single booking that flows end-to-end**: online booking → payment → check-in at the hospital → live queue position → doctor consultation → records + notifications — with the same data visible on every surface.

Live endpoints (demo):
| Surface | URL |
|---|---|
| Backend API | `https://pulse-o3gj.onrender.com/api` |
| Web dashboard | `https://pulse-web-wheat.vercel.app` |
| Mobile app | Expo dev build / Expo Go (`.env` → live API, `EXPO_PUBLIC_USE_MOCK=false`) |

---

## 2. Repositories & ownership

| Repo | Stack | Owner | Role in the stack |
|---|---|---|---|
| `psam-717/pulse` (backend) | Spring Boot 4 / Java 25 | psam-717 | Single API for web + mobile; auto-deploys to Render on `main` |
| `housebuoy/pulse-web` (web) | Next.js | housebuoy (psam + collaborator develop) | Admin + doctor dashboard; deploys to Vercel on merged `main` |
| `housebuoy/pulse-mobile` (mobile) | Expo / React Native | housebuoy (psam + kquarcoo) | Patient app; shipped via develop → main PRs |

**Cadence discipline:** never push straight to `main`. Backend merges per-feature PRs (Render auto-deploys). Web/mobile stack on long-lived `develop` with granular conventional commits; a single consolidated `develop → main` PR closes each phase checkpoint.

---

## 3. What was built (features)

### 3.1 Backend (API — `psam-717/pulse`)
- **Auth & accounts**
  - Staff login with **per-account 2FA toggle** (OTP issued only when enabled; direct JWT when off), session registry (`sid` claim + server-side revocation), `/auth/me`.
  - Patient signup + verify-OTP, login by phone / ghanaCard / patient number, patient number auto-assignment + idempotent backfill.
  - **Patient 3-step password reset** (request → verify → confirm) + resend-OTP, SMS via **Arkesel**, gated by an `ARKESEL_REAL` env switch (sandbox/dev-echo otherwise).
  - **Staff forgot-password** via email (Resend) — merged Sep 9.
  - Facility-scoped JWT tenancy everywhere (`SecurityUtils.requireFacilityId()` / `requireStaffId()`); explicit SecurityConfig permit lists for anonymous auth paths.
- **Booking lifecycle (mobile online booking)**
  - Department availability grid from working hours, bookings by department/date/time, **server-side doctor resolution to staff-linked doctors only**, PENDING_PAYMENT → paid via webhook, pay-by-deadline, reschedule, cancel + refund, patient notifications on approval/cancel.
  - Payments: **Aza hosted checkout + webhook**, mobile-money/card saved methods (MoMo identified by full wallet number), outstanding balance endpoint.
- **Live queue engine**
  - Walk-in registration, patient self check-in/cancel on a booking, desk/doctor **check-in hand-off from appointments**, atomic call-next (pessimistic lock), status machine (WAITING → IN_CONSULTATION → COMPLETED / NO_SHOW / SKIPPED / CANCELLED), staff queue views, **collision-proof ticket numbers** (`max(sequence)+1` per prefix) in all three generators.
  - Patient ticket = **positions, not ticket digits**: `queueTotal / aheadCount / servedCount`, wait estimate, hospital/dept/doctor context.
  - KNUST (facility 3) now has a staff-linked web doctor (`kelvinquarcoo247@gmail.com`) → its General OPD is online-bookable.
- **Clinical records** — staff authoring + patient reads (`/patients/me/records`), flat records model (visit notes + prescriptions) that is the single source of truth (see Limitations on the richer UI).
- **Notifications** — patient in-app feed on booking lifecycle; staff queue fan-out to FRONT_DESK + ADMIN.
- **Settings & team** — per-account sessions/2FA/profile, permission matrix, staff invites, staff CRUD (facility-scoped, admin-only writes), operational settings (slot minutes, pay-by-deadline).
- **Demo data seeder** — idempotent, self-healing on every boot (roster, departments, bookings, queue timestamps, records, payment methods, KNUST facility + doctor).

### 3.2 Web dashboard (`housebuoy/pulse-web`)
- **Admin (/d)** and **doctor (/w)** workspaces with role-aware routing.
- **Appointments**: day list + Upcoming/Week/Month range views, per-status actions driven by a state machine (scheduled → confirm/cancel, confirmed → **check in** / no-show, checked_in → undo), payment chips + Mark-paid, ~5s polling for live payment flips, stable staff-id scoping.
- **Live queue**: department filter, now-serving panel, waiting list, call-next, walk-in registration, duration/priority/source badges.
- **Patients & records**: patient list + detail, clinical record authoring surfaces.
- **Settings**: 2FA toggle (real gate at login), sessions (list + revoke), profile, team & access (invites, permission matrix), operational settings.
- **Auth**: login with dev-mode OTP echo toast; staff forgot-password flow (email).
- Design system: Tailwind + shadcn-style tokens/components; mock layer (`lib/mock/*`) parity behind `NEXT_PUBLIC_USE_MOCK`.

### 3.3 Mobile patient app (`housebuoy/pulse-mobile`)
- **Auth**: signup with OTP, login by phone/ghanaCard/patient number, forgot/reset password screens (dev-mode OTP banner with tap-to-fill).
- **Home**: hero carousel of upcoming confirmed bookings with **gradient cover cards** (auto-advance + tappable dots, one card per swipe), live-queue card fed by ticket positions.
- **Book appointment**: hospital discovery (approved list + filters + search), department select, date strip + month selector, time-slot grid from live availability, **booking → outstanding → payment** flow.
- **Queue**: live ticket with hospital/dept/doctor, position ("#X · Y in queue"), progress, cancel.
- **Records / profile / payments / notifications / medical ID / insurance**: patient-facing sections, hydration pattern to keep live state truthful (no stale AsyncStorage cards).
- API layer (`src/lib/api/*`: auth, discovery, queue, records, patient, notifications, appointments) with mock/real parity like the web.

---

## 4. Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 25, Spring Boot **4.0.4**, Spring Security + JWT, Spring Data JPA, PostgreSQL (Render Postgres), Maven (`start.bat compile` gate), REST JSON |
| Web | Next.js **16.2.9**, React **19.2.4**, TypeScript, TanStack Query 5, Axios, Tailwind + shadcn-style components |
| Mobile | Expo SDK **57**, React Native 0.86.3, React 19, TypeScript ~6.0.3, expo-router, Zustand (client state), NativeWind, date-fns |
| Infra | Render (backend auto-deploy on main), Vercel (web), Expo Go/dev builds (mobile), GitHub PR workflows |
| 3rd-party | Arkesel (SMS OTP), Resend (staff email reset), Aza (payment checkout/webhooks), OpenRouter (agent tooling — out of product scope) |

**Dev conveniences:** dev-mode OTP echo (`devOtp` in API + toast/banner) so hand-tests never block on delivery; sandbox payment flow; demo accounts with known passwords.

---

## 5. Architecture decisions worth defending (lecturer Q&A material)

1. **Contract-first development.** The web's TypeScript types + `lib/mock/*` are the API contract; `BACKEND_SPEC.md` cites them. New backend DTOs must serialize to exactly those shapes (additive keys tolerated; missing keys break clients).
2. **Tenancy = facility from the JWT, never from client params.** Every web route reads the facility from the token; cross-facility reads return 404. This is the core security posture.
3. **Online booking resolves to staff-linked doctors only** (legacy `doctors` row whose email maps to a DOCTOR-role staff member of the same facility). Why: an appointment must land in a real doctor's web workspace. Clients see `bookableOnline` so they never offer unbookable departments.
4. **Queue tickets are collision-proof sequences; progress is positional.** Ticket numbers span days (per-prefix `max+1` over all history), so the UI computes "Y in queue" from active rows before the patient, never from ticket digits. Lesson learned the hard way: **three ticket generators existed and only two were hardened** — the third 409'd on a duplicate-ticket unique index (silent "dead button"); all three now use the same generator.
5. **One status state machine, enforced server-side**, mirrored by UI actions: `scheduled → confirmed → checked_in → (queue hand-off)`, undo paths, terminal completed/cancelled/no-show. `checked_in` synchronously creates the queue entry (single transaction).
6. **Persisted settings toggle = real gate.** A stored flag is not a control until the code path that changes behavior reads it (2FA toggle decides whether login issues OTP).
7. **Instant timestamps** for FE-friendly ISO-8601 (zone-less LocalDateTime breaks JS Date parsing).
8. **Dev-echo vs real delivery are separate switches.** `OTP_DEV_MODE` stays on for staff 2FA (no SMS channel); patient SMS is gated by `ARKESEL_REAL` — flipping one never breaks the other.
9. **Self-healing demo data.** The seeder is idempotent per email/phone and re-stamps stale queue timestamps every boot because Render Postgres persists across deploys.
10. **Live E2E before "done".** Fakes miss real-shape mismatches; every merge is replayed against the live API with real tokens before being declared working.

---

## 6. Live demo map (dev credentials — never for production)

| Facility | Notes |
|---|---|
| Korle Bu Teaching Hospital (facility 1) | Full demo roster: admin `sarah.jenkins@knust-hospital.test` / `Password123!`; doctors `boateng`/`owusu`/`kusi`/`mensima` @pulsehealth.test (2FA off); nurses + front desk |
| Ridge Hospital (facility 2) | Seeded, minimal roster |
| KNUST University Hospital (facility 3) | General OPD; **Dr. Kelvin Quarcoo** `kelvinquarcoo247@gmail.com` / `Password123!` (2FA off) — only staff-linked doctor, department online-bookable |

Patient hand-test accounts: PT-00101 (Kwame, ghanaCard `GHA-000000001`, patient123) and PT-00114 (Marvinphil Psam, phone `0200433286`, `Password1234`) — plus APT-0051 (patient 14 → Dr. Kelvin Quarcoo, KNUST, Thu 09-10 08:20, confirmed+paid) ready for check-in demos.

---

## 7. Current limitations (be honest in the room)

- **No production hardening**: dev-echo OTP, sandbox payments, demo passwords, permissive demo data. Real SMS waits on Arkesel sender-ID approval (`Pulse` whitelist); flip `ARKESEL_REAL=true` + `ARKESEL_SANDBOX=false` when approved.
- **No CI/CD test suites.** Backend gate is compile (`start.bat compile`); optional test suite needs local Postgres. Mobile gate is `tsc --noEmit`; web gate is Next build. No automated E2E — replaced by live replay discipline.
- **Mobile debt**: `develop` is 15 commits ahead of `main` (carousel polish + dev-OTP) waiting for the checkpoint PR; ESLint baseline ~63 react-hooks-v6 errors; one TS css-decl fix pending; no test suite.
- **Web**: the richer structured-consultation UI (diagnosis/plan/prescriptions per visit) has **no backend model** and is parked on `archive/fe-workspace-rich-consultation` (earlier `archive/fe-records-richer-model`). The live-verified flat records model is truth.
- **Product gaps**: no doctor-picker on mobile (department-level booking; single staff-linked doctor per dept = deterministic today); check-in is allowed before the appointment day (no day-of gate); single-active queue ticket per patient (no same-day two-doctor bookings); KNUST demo data is thin (1 doctor, 1 dept).
- **Enums/serialization quirks** (lowercased enum names vs display labels) and mock/real parity rules must be respected by every contributor.
- Booking state is real but demo volumes are tiny — nothing about scale/load has been proven.

---

## 8. Future projections

**Product:**
1. Structured consultation records (backend first, then un-archive the rich UI) — diagnosis, plan, prescriptions per visit.
2. Patient chooses a specific doctor where a department has several bookable doctors.
3. Gate check-in to the appointment day (front-desk/patient) with a clear "not yet" state.
4. Go live with real SMS (Arkesel approval) and production payment keys; retire dev-echo to a per-environment flag.
5. Telehealth/video visits, insurance/claims, medical-file uploads, family/guardian profiles, appointment reminders.
6. Facility onboarding via the web (register hospital → admin console → invite staff), analytics/reports dashboards.

**Engineering:**
7. CI pipelines (build + typecheck + test per PR) and a browser/mobile E2E smoke suite against the deployed API.
8. Backend test-suite expansion (unit + integration with testcontainers), mobile ESLint cleanup to zero new-errors policy.
9. Observability (structured logs, metrics, tracing), rate limiting, audit log for admin actions.
10. Scale path: multi-facility at Postgres level today; add read replicas/queue workers/background jobs when demo volume outgrows a single instance.

---

## 9. Quick 5-minute demo script

1. Web: login `sarah.jenkins@knust-hospital.test` / `Password123!` → Live Queue (Korle Bu board) + Appointments (payments visible).
2. Mobile: login PT-00114 / `Password1234` → Home carousel → Book Appointment → KNUST → General OPD → pick Thu slot → Proceed → payment.
3. Web as Dr. Kelvin Quarcoo (KNUST) → see the new appointment → **Check in** → appears in Live Queue with ticket K-002.
4. Mobile as the patient → live queue ticket with position → cancel/undo story optional.

---

_This summary is maintained in `housebuoy/pulse-web` and reflects the state on 2026-09-09; re-check the live repos/deploys before presenting._
