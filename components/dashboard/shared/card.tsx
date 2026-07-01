import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Flat card — 0.5px-feeling border, 12px radius, no shadow.
 * The single card primitive for the dashboard. Use padding="none" when the
 * card contains a table or list that bleeds to the edges.
 */
export function Card({
  children,
  className,
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const p = { none: "", sm: "p-4", md: "p-5", lg: "p-6" }[padding];
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface",
        p,
        className,
      )}
    >
      {children}
    </div>
  );
}
