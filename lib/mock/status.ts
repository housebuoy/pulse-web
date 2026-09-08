// Simulated platform health for /status.
//
// SIMULATED — every value below is a local literal. The real version does
// NOT come from the Pulse backend: service health, uptime, and incident
// history are owned by the monitoring/status provider (Statuspage, Better
// Stack, or whatever we settle on), so this reads from that provider's
// public status API rather than through lib/axios.ts. That is also why
// there is no lib/api/status.ts swap file to pair with this one — a
// USE_MOCK swap here would imply a Pulse endpoint that will never exist.
// Same "mock module with no api swap layer" shape as
// lib/mock/access-request.ts (BACKEND_SPEC §6.10).

export type ServiceHealth =
  | "operational"
  | "degraded"
  | "partial-outage"
  | "maintenance";

export interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  health: ServiceHealth;
}

export interface StatusIncident {
  id: string;
  title: string;
  /** ISO date — rendered through lib/format.ts. */
  date: string;
  status: "resolved" | "monitoring" | "investigating";
  summary: string;
}

export interface PlatformStatus {
  /** Worst health across services — drives the banner. */
  overall: ServiceHealth;
  services: ServiceStatus[];
  /** Rolling 90-day availability, as a percentage. */
  uptime90d: number;
  incidents: StatusIncident[];
  /** ISO timestamp of the last health check. */
  checkedAt: string;
}

// Deliberately a fixed timestamp, not new Date(): a value computed at
// render time differs between the server render and the client hydration
// and throws a mismatch — the same trap lib/format.ts warns about for
// locale-dependent formatting. The real page gets this field from the
// monitoring provider's payload, so it is data there too, not a clock read.
const CHECKED_AT = "2026-09-08T09:40:00";

const SERVICES: ServiceStatus[] = [
  {
    id: "api",
    name: "API",
    description: "Core application requests and authentication",
    health: "operational",
  },
  {
    id: "database",
    name: "Database",
    description: "Patient, staff, and facility record storage",
    health: "operational",
  },
  {
    id: "booking",
    name: "Booking",
    description: "Appointments, scheduling, and live queue",
    health: "operational",
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Email and SMS delivery, in-app alerts",
    health: "operational",
  },
  {
    id: "payments",
    name: "Payments",
    description: "Subscription billing and invoicing",
    health: "operational",
  },
];

const INCIDENTS: StatusIncident[] = [];

/** Worst health wins — one degraded service degrades the whole banner. */
const SEVERITY: Record<ServiceHealth, number> = {
  operational: 0,
  maintenance: 1,
  degraded: 2,
  "partial-outage": 3,
};

function worstHealth(services: ServiceStatus[]): ServiceHealth {
  return services.reduce<ServiceHealth>(
    (worst, service) =>
      SEVERITY[service.health] > SEVERITY[worst] ? service.health : worst,
    "operational",
  );
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function getPlatformStatus(): Promise<PlatformStatus> {
  return delay({
    overall: worstHealth(SERVICES),
    services: SERVICES,
    uptime90d: 99.98,
    incidents: INCIDENTS,
    checkedAt: CHECKED_AT,
  });
}
