"use client";

import { useEffect, useState } from "react";

function format(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${(minutes % 60).toString().padStart(2, "0")}m`;
}

/** Ticks every second. Initialised deterministically to avoid hydration
 *  mismatch, then corrected to real elapsed time on mount. */
export function LiveDuration({
  since,
  className,
}: {
  since: string;
  className?: string;
}) {
  const [now, setNow] = useState(() => new Date(since).getTime());

  useEffect(() => {
    // Avoid synchronous setState in effect by deferring the initial update
    // to the next tick, preventing cascading renders.
    const initTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(id);
    };
  }, []);

  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(since).getTime()) / 1000),
  );
  return <span className={className}>{format(elapsed)}</span>;
}