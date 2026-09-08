/**
 * Shared shimmer skeleton for detail/edit pages while the record loads —
 * consistent sweep effect instead of per-page "Loading…" text.
 */
export function DetailSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-6 w-48 shimmer rounded bg-surface-muted" />
      <div className="h-4 w-64 shimmer rounded bg-surface-muted" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 w-full shimmer rounded bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
