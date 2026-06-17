"use client";

import type { KitchenBoardStats } from "@/lib/kitchen/display";
import { cn } from "@/lib/utils";

interface KitchenStatsPillProps {
  stats: KitchenBoardStats;
  className?: string;
}

export function KitchenStatsPill({ stats, className }: KitchenStatsPillProps) {
  const segments = [
    { label: "Total items", value: stats.totalItems },
    { label: "Called", value: stats.called },
    { label: "Pending", value: stats.pending },
  ] as const;

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-full border border-border bg-card/80 px-4 py-2 text-sm shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {segments.map((segment, index) => (
        <span key={segment.label} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          ) : null}
          <span className="text-muted-foreground">{segment.label}:</span>
          <span
            key={segment.value}
            className="kitchen-stat-pop font-semibold tabular-nums"
          >
            {segment.value}
          </span>
        </span>
      ))}
    </div>
  );
}
