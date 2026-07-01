import { cn } from "@/lib/utils";
import { StatTile, StatTileSkeleton, type StatTileProps } from "./stat-tile";
import { LiveStatusIndicator } from "@/components/dashboard/live-status-indicator";

interface StatBarProps {
  tiles: StatTileProps[];
  live?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Horizontal stat band — flat card, tiles left-aligned at their natural width,
 * divided by hairline borders. Does NOT stretch tiles to fill remaining space
 * (a 3-stat Live Queue band won't leave huge empty cells beside a 5-stat
 * Appointments band). The optional live indicator is pinned to the right.
 */
export function StatBar({ tiles, live, isLoading, className }: StatBarProps) {
  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      {/* tile group — natural content width, NOT flex-1 */}
      <div className="flex divide-x divide-border">
        {tiles.map((tile, i) => (
          <div key={`${tile.label}-${i}`} className="px-5 py-3">
            {isLoading ? <StatTileSkeleton /> : <StatTile {...tile} />}
          </div>
        ))}
      </div>

      {/* live indicator — pushed to the right edge */}
      {live && (
        <div className="ml-auto hidden items-center border-l border-border px-4 py-3 sm:flex">
          <LiveStatusIndicator interval={live} />
        </div>
      )}
    </div>
  );
}
