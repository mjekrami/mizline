"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  ANALYTICS_DATE_PRESETS,
  type AnalyticsDatePresetId,
  type AnalyticsDateRangeSelection,
} from "@/lib/admin/analytics-format";
import { cn } from "@/lib/utils";

interface AnalyticsFiltersMenuProps {
  activePreset: AnalyticsDatePresetId | null;
  onPresetSelect: (
    range: AnalyticsDateRangeSelection,
    presetId: AnalyticsDatePresetId,
  ) => void;
  onReset: () => void;
}

export function AnalyticsFiltersMenu({
  activePreset,
  onPresetSelect,
  onReset,
}: AnalyticsFiltersMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition",
          open || activePreset
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Date range
          </p>
          {ANALYTICS_DATE_PRESETS.map((preset) => {
            const active = activePreset === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onPresetSelect(preset.getRange(), preset.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-muted",
                  active && "bg-muted font-medium text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}

          <div className="my-2 border-t border-border/60" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
            className="flex w-full rounded-md px-2 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Reset to last 7 days
          </button>
        </div>
      ) : null}
    </div>
  );
}
