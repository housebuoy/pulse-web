// In-app notification feed. Separate from the Settings email/SMS delivery
// toggles — those control backend delivery; this feed is always shown.

export type NotificationType =
  | "queue"       // queue surge / alert
  | "no_show"     // patient no-show
  | "appointment" // booking / check-in event
  | "staff"       // staff duty / role change
  | "summary"     // daily/shift digest
  | "system";     // config / settings change

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  createdAt: string; // ISO datetime
  read: boolean;
  /** Route to navigate on click (e.g. "/d/live-queue"). Null = no action. */
  link?: string;
}
