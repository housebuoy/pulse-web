/* eslint-disable @next/next/no-img-element */
// <img> is intentional — avatarUrl is a local blob: object URL that
// can't pass through next/image's optimizer.
import { cn } from "@/lib/utils";

const SIZE: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "size-6 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
};

/**
 * Shows an image when avatarUrl is provided, otherwise falls back to coloured
 * initials. Works for both the admin profile (shape="square" in the sidebar)
 * and staff members (shape="circle" in list views).
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
  shape = "circle",
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "circle" | "square";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const radius = shape === "circle" ? "rounded-full" : "rounded-lg";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          "shrink-0 object-cover",
          SIZE[size],
          radius,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-brand/10 font-bold text-brand",
        SIZE[size],
        radius,
        className,
      )}
    >
      {initials}
    </div>
  );
}
