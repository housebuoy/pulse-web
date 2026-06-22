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
      <span className="text-2xl font-bold tracking-tight tabular-nums text-fg">
        {isLoading ? "—" : value}
      </span>
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}
