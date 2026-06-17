"use client";

import { CalendarDays } from "lucide-react";
import { AnalyticsFiltersMenu } from "@/components/admin/analytics/analytics-filters-menu";
import type {
  AnalyticsDatePresetId,
  AnalyticsDateRangeSelection,
} from "@/lib/admin/analytics-format";

interface AnalyticsHeaderProps {
  startDate: string;
  endDate: string;
  activePreset: AnalyticsDatePresetId | null;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onPresetSelect: (
    range: AnalyticsDateRangeSelection,
    presetId: AnalyticsDatePresetId,
  ) => void;
  onResetFilters: () => void;
}

export function AnalyticsHeader({
  startDate,
  endDate,
  activePreset,
  onStartDateChange,
  onEndDateChange,
  onPresetSelect,
  onResetFilters,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time insights to grow your café.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="border-0 bg-transparent p-0 text-sm font-medium outline-none"
            aria-label="Start date"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="border-0 bg-transparent p-0 text-sm font-medium outline-none"
            aria-label="End date"
          />
        </div>

        <AnalyticsFiltersMenu
          activePreset={activePreset}
          onPresetSelect={onPresetSelect}
          onReset={onResetFilters}
        />
      </div>
    </div>
  );
}
