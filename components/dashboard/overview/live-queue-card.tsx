"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useDepartmentQueue } from "@/hooks/use-dashboard";
import type { DepartmentQueue, QueueSeverity } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

/** Severity → tailwind dot + chip colors. */
const severityChip: Record<QueueSeverity, { label: string; cls: string }> = {
  ok: { label: "Stable", cls: "bg-emerald-400/90 text-emerald-950" },
  warning: { label: "Busy", cls: "bg-amber-400/90 text-amber-950" },
  critical: { label: "Critical", cls: "bg-rose-500/90 text-white" },
};

/** Severity → soft gradient wash behind the slide. */
const severityWash: Record<QueueSeverity, string> = {
  ok: "linear-gradient(135deg, rgba(22,163,74,0.28), rgba(42,121,233,0.10) 55%, rgba(15,23,42,0.05))",
  warning:
    "linear-gradient(135deg, rgba(217,119,6,0.34), rgba(42,121,233,0.12) 60%, rgba(15,23,42,0.06))",
  critical:
    "linear-gradient(135deg, rgba(220,38,38,0.42), rgba(42,121,233,0.12) 65%, rgba(15,23,42,0.08))",
};

function QueueSpotlightSlide({ row }: { row: DepartmentQueue }) {
  const chip = severityChip[row.severity];
  return (
    <div className="group relative h-52 w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-subtle select-none">
      {/* Severity-tinted wash */}
      <div
        className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: severityWash[row.severity] }}
      />
      {/* Oversized watermark (hover zoom mirrors the guide's image scale) */}
      <Users
        aria-hidden
        className="absolute -right-7 -bottom-7 size-44 text-white/10 transition-transform duration-500 ease-in-out group-hover:scale-110"
        strokeWidth={1.2}
      />

      {/* Bottom dark fade so white text stays legible on any wash */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-slate-950/75 via-slate-950/30 to-transparent" />

      {/* Top row: live status + severity chip */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-sm">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-white" />
          </span>
          {row.statusLabel}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase",
            chip.cls
          )}
        >
          {chip.label}
        </span>
      </div>

      {/* Bottom content: big waiting count + dept + max wait */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.14em] text-white/60 uppercase">
            Waiting now
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl leading-none font-black tracking-tight text-white tabular-nums">
              {row.waiting}
            </span>
            <span className="text-sm font-semibold text-white/70">patients</span>
          </div>
          <h3 className="mt-2 truncate text-base font-bold text-white">
            {row.department}
          </h3>
        </div>
        <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-right backdrop-blur-sm">
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/60 uppercase">
            Max wait
          </p>
          <p className="text-lg leading-tight font-extrabold text-white tabular-nums">
            {row.maxWaitMinutes}m
          </p>
        </div>
      </div>
    </div>
  );
}

export function LiveQueueCard() {
  const { data: rows = [], isLoading } = useDepartmentQueue();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Wrapping last → first should jump instantly, not rewind through slides.
  const [noAnim, setNoAnim] = useState(false);
  const indexRef = useRef(0);
  const moveToRef = useRef<(raw: number) => void>(() => {});

  const count = rows.length;

  const moveTo = (raw: number) => {
    if (count === 0) return;
    const target = ((raw % count) + count) % count;
    if (indexRef.current === count - 1 && target === 0 && count > 1) {
      // Flag BEFORE the state change so the wrap paint renders transitionless.
      setNoAnim(true);
      requestAnimationFrame(() => setNoAnim(false));
    }
    indexRef.current = target;
    setIndex(target);
  };
  moveToRef.current = moveTo;

  // Auto-advance every 5s unless hovered/focused or too few slides.
  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => moveToRef.current(indexRef.current + 1), 5_000);
    return () => clearInterval(t);
  }, [count, paused]);

  // Clamp if the list shrinks so the transform never points past the end.
  useEffect(() => {
    if (count > 0 && indexRef.current >= count) moveToRef.current(0);
  }, [index, count]);

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-fg">Live Department Queue</h2>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
        </div>
        <Link
          href="/d/live-queue"
          className="text-sm font-medium text-brand hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="px-5 pb-2">
        {isLoading ? (
          <div className="h-52 w-full rounded-2xl border border-border bg-surface-subtle">
            <div className="h-full w-full shimmer rounded-2xl bg-surface-muted" />
          </div>
        ) : count === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface-subtle text-center">
            <Users className="size-8 text-fg-placeholder" />
            <p className="text-sm font-medium text-fg-muted">
              No departments are queueing right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Slides */}
            <div
              className="flex overflow-hidden rounded-2xl"
              role="region"
              aria-roledescription="carousel"
              aria-label="Live department queues"
            >
              <div
                className={cn(
                  "flex transition-transform duration-500 ease-in-out",
                  noAnim && "transition-none"
                )}
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="w-full shrink-0 px-0.5"
                    aria-roledescription="slide"
                    aria-label={`${row.department}: ${row.waiting} waiting, max wait ${row.maxWaitMinutes} minutes`}
                  >
                    <QueueSpotlightSlide row={row} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dot navigation (mirrors the guide's elongated active dot) */}
            {count > 1 && (
              <div className="flex items-center justify-center gap-2 pb-2">
                {rows.map((row, i) => (
                  <button
                    key={row.id}
                    onClick={() => moveTo(i)}
                    aria-label={`Go to ${row.department}`}
                    className={cn(
                      "h-2 cursor-pointer rounded-full transition-all duration-500 ease-in-out",
                      i === index
                        ? "w-5 bg-brand opacity-100"
                        : "w-2 bg-fg-placeholder opacity-40 hover:opacity-70"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
