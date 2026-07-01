import type { Notification } from "@/lib/types/notifications";

// Timestamps computed once at module load (browser context only — the panel
// never renders server-side because it's inside a Popover that's closed by
// default, so there's no SSR/hydration risk from Date.now() here).
function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const seed: Notification[] = [
  // ---- unread ----
  {
    id: "n-1",
    type: "queue",
    title: "Emergency queue backed up",
    body: "7 patients waiting — longest wait 34 m.",
    createdAt: ago(4),
    read: false,
    link: "/d/live-queue?department=emergency",
  },
  {
    id: "n-2",
    type: "no_show",
    title: "Kofi Antwi missed appointment",
    body: "APT-1046 · Emergency · 09:45",
    createdAt: ago(18),
    read: false,
    link: "/d/appointments",
  },
  {
    id: "n-3",
    type: "appointment",
    title: "New appointment: Kwame Mensah",
    body: "Cardiology · Dr. Owusu · tomorrow 10:00",
    createdAt: ago(37),
    read: false,
    link: "/d/appointments",
  },
  {
    id: "n-4",
    type: "staff",
    title: "Dr. Frimpong marked On Leave",
    body: "Emergency — 1 fewer doctor on shift today.",
    createdAt: ago(62),
    read: false,
    link: "/d/staff/staff-frimpong",
  },
  // ---- read ----
  {
    id: "n-5",
    type: "appointment",
    title: "Efua Koomson checked in",
    body: "APT-1053 · Cardiology",
    createdAt: ago(105),
    read: true,
    link: "/d/appointments",
  },
  {
    id: "n-6",
    type: "summary",
    title: "Yesterday's summary",
    body: "42 patients served · 91 % satisfaction · 3 no-shows.",
    createdAt: ago(60 * 14),
    read: true,
    link: "/d/analytics",
  },
  {
    id: "n-7",
    type: "no_show",
    title: "Yaa Boatemaa no-show",
    body: "APT-1051 · Pediatrics · 12:00",
    createdAt: ago(60 * 18),
    read: true,
    link: "/d/appointments",
  },
  {
    id: "n-8",
    type: "system",
    title: "Queue refresh interval updated",
    body: "Now polling every 10 s (was 30 s).",
    createdAt: ago(60 * 26),
    read: true,
    // no link — system notifications don't navigate anywhere
  },
];

// Mutable in-session store — read/unread state persists during the session.
let store: Notification[] = seed.map((n) => ({ ...n }));

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

export function listNotifications(): Promise<Notification[]> {
  return delay(store.map((n) => ({ ...n })));
}

export function getUnreadCount(): Promise<number> {
  return delay(store.filter((n) => !n.read).length);
}

export function markRead(id: string): Promise<Notification[]> {
  store = store.map((n) => (n.id === id ? { ...n, read: true } : n));
  return delay(store.map((n) => ({ ...n })));
}

export function markAllRead(): Promise<Notification[]> {
  store = store.map((n) => ({ ...n, read: true }));
  return delay(store.map((n) => ({ ...n })));
}
