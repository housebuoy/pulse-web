import { cn } from "@/lib/utils";

export function StepProgress({
  current,
  total = 3,
}: {
  current: number;
  total?: number;
}) {
  return (
    <div className="mb-16 flex items-center justify-between">
      <div className="flex w-48 gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-1/3 rounded-full",
              i < current ? "bg-brand" : "bg-surface-muted",
            )}
          />
        ))}
      </div>
      <span className="text-body-sm text-fg-muted">
        Step {current} of {total}
      </span>
    </div>
  );
}
