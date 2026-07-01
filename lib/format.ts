// Centralized date/time formatting.
//
// toLocaleDateString / toLocaleTimeString / toLocaleString resolve to the
// *runtime's* default locale when called without an explicit locale arg.
// That default differs between the Node server (SSR) and the browser
// (hydration), so the same Date renders different text in each — a
// server/client mismatch and a hydration error. Every formatter below pins
// the locale explicitly so the output is deterministic regardless of where it
// runs. Never call toLocaleDateString/toLocaleTimeString/toLocaleString
// directly elsewhere — add or use a helper here instead.

/** Default locale — also exported so analytics-utils.ts can import it as a
 *  static string for Recharts axis labels. */
export const LOCALE = "en-US";

/**
 * Runtime-mutable locale. Defaults to LOCALE ("en-US").
 * Call setLocale() when the user changes their date-format preference so that
 * all subsequent formatDate/formatTime calls reflect the new setting.
 * The server always uses the default; the client updates after hydration.
 */
let _locale = LOCALE;

export function setLocale(locale: string): void {
  _locale = locale;
}

export function getLocale(): string {
  return _locale;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function toDate(value: string | Date): Date {
  if (typeof value !== "string") return value;
  // Date-only keys ("YYYY-MM-DD") parse as UTC midnight by default, which
  // rolls back to the previous day in negative-UTC-offset timezones. Forcing
  // a local-time parse keeps the displayed day correct.
  return new Date(DATE_ONLY.test(value) ? `${value}T00:00:00` : value);
}

// "Monday, June 22, 2026" — matches the dashboard header's date line.
export function formatLongDate(value: string | Date): string {
  return toDate(value).toLocaleDateString(_locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// "Jun 22, 2026"
export function formatShortDate(value: string | Date): string {
  return toDate(value).toLocaleDateString(_locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// "9:41 AM"
export function formatTime(value: string | Date): string {
  return toDate(value).toLocaleTimeString(_locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// "Jun 22, 2026" or "Jun 22, 2026 – Jun 30, 2026" when the range spans days.
export function formatRangeLabel(from: string | Date, to: string | Date): string {
  const a = formatShortDate(from);
  const b = formatShortDate(to);
  return a === b ? a : `${a} – ${b}`;
}

// "Jun 22, 2026, 9:41 AM" — date + time together, e.g. "Recorded …", "Joined …"
export function formatJoined(value: string | Date): string {
  return toDate(value).toLocaleString(_locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
