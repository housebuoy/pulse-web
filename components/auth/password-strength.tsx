"use client";

// Password rules + strength meter for the screens that SET a password
// without a session behind them (/new-password today; the activate and
// onboarding admin steps state the same policy in prose). The rule list is
// the app's existing stated policy — "at least 8 characters with a number
// and symbol" — kept as data here so the UI and the submit guard can't
// drift apart. Mixed case is scored but not required, matching that copy.
//
// Client-side only, and only ever a hint: the real strength/reuse/breach
// checks are the backend's (see lib/mock/settings.ts's note on the
// change-password path).

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRule {
  label: string;
  required: boolean;
  test: (value: string) => boolean;
}

const RULES: PasswordRule[] = [
  { label: "At least 8 characters", required: true, test: (v) => v.length >= 8 },
  { label: "Contains a number", required: true, test: (v) => /\d/.test(v) },
  {
    label: "Contains a symbol",
    required: true,
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
  {
    label: "Upper and lowercase letters",
    required: false,
    test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
];

/** The submit guard — only the required rules gate the form. */
export function isPasswordValid(value: string): boolean {
  return RULES.every((rule) => !rule.required || rule.test(value));
}

const LEVELS = [
  { label: "Too weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-brand", text: "text-brand" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
] as const;

/** 1–4, from the rules passed plus a length bonus at 12+ characters. */
function strengthIndex(value: string): number {
  const passed = RULES.filter((rule) => rule.test(value)).length;
  const score = passed + (value.length >= 12 ? 1 : 0);
  if (score <= 2) return 1;
  if (score === 3) return 2;
  if (score === 4) return 3;
  return 4;
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;

  const level = strengthIndex(value);
  const { label, bar, text } = LEVELS[level - 1];

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {LEVELS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < level ? bar : "bg-border",
              )}
            />
          ))}
        </div>
        <span className={cn("text-caption font-medium", text)}>{label}</span>
      </div>

      <ul className="space-y-1">
        {RULES.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-2 text-caption",
                met ? "text-success" : "text-fg-muted",
              )}
            >
              <Check
                className={cn(
                  "size-3.5 shrink-0",
                  met ? "opacity-100" : "opacity-30",
                )}
              />
              {rule.label}
              {!rule.required && (
                <span className="text-fg-placeholder">(recommended)</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
