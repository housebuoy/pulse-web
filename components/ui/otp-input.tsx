"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, length = 6, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const cells = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusIndex = (i: number) => refs.current[i]?.focus();
  const setDigit = (i: number, d: string) => {
    const next = cells.slice();
    next[i] = d;
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "");
    if (!d) return setDigit(i, "");
    setDigit(i, d[d.length - 1]); // last char typed
    if (i < length - 1) focusIndex(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[i]) setDigit(i, "");
      else if (i > 0) { focusIndex(i - 1); setDigit(i - 1, ""); }
    } else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); focusIndex(i - 1); }
    else if (e.key === "ArrowRight" && i < length - 1) { e.preventDefault(); focusIndex(i + 1); }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {cells.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-12 rounded-md border bg-surface text-center text-h2 text-fg transition-colors",
            "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
            digit ? "border-fg-placeholder" : "border-border",
          )}
        />
      ))}
    </div>
  );
}