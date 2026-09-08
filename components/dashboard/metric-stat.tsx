export function MetricStat({
  value,
  label,
  isLoading,
}: {
  value: string | number;
  label: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col">
      {isLoading ? (
        <span
          aria-hidden
          className="h-7 w-16 shimmer rounded bg-surface-muted"
        />
      ) : (
        <span className="text-2xl font-bold tracking-tight tabular-nums text-fg">
          {value}
        </span>
      )}
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}
