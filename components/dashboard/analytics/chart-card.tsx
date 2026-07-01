import type { ReactNode } from "react";

export function ChartCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-fg">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
