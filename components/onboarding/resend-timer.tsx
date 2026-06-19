"use client";

import { useEffect, useState } from "react";

interface ResendTimerProps {
  seconds?: number;
  onResend: () => void;
}

export function ResendTimer({ seconds = 30, onResend }: ResendTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <p className="text-body-sm text-fg-muted">
      Didn&apos;t get it?{" "}
      {remaining > 0 ? (
        <span>Resend code in {mmss}</span>
      ) : (
        <button
          type="button"
          onClick={() => { onResend(); setRemaining(seconds); }}
          className="font-medium text-brand hover:underline"
        >
          Resend code
        </button>
      )}
    </p>
  );
}