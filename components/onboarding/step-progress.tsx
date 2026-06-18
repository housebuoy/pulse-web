import { ArrowLeft } from "lucide-react";

interface StepProgressProps {
  current: number;
  total?: number;
  onBack?: () => void;
}

export function StepProgress({ current, total = 3, onBack }: StepProgressProps) {
  return (
    <div className="mb-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        <div className="flex w-48 gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i}
              className={`h-1.5 w-1/3 rounded-full ${i < current ? "bg-brand" : "bg-surface-muted"}`} />
          ))}
        </div>
      </div>
      <span className="text-body-sm text-fg-muted">Step {current} of {total}</span>
    </div>
  );
}