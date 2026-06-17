"use client";

import { formatHourLabel } from "@/lib/admin/analytics-format";
import { cn } from "@/lib/utils";

export interface HourRange {
  startHour: number;
  endHour: number;
}

interface HourRangeSliderProps {
  value: HourRange;
  onChange: (value: HourRange) => void;
  className?: string;
}

export function HourRangeSlider({ value, onChange, className }: HourRangeSliderProps) {
  const { startHour, endHour } = value;
  const startPercent = (startHour / 23) * 100;
  const endPercent = (endHour / 23) * 100;

  const updateStart = (nextStart: number) => {
    onChange({
      startHour: Math.min(nextStart, endHour),
      endHour,
    });
  };

  const updateEnd = (nextEnd: number) => {
    onChange({
      startHour,
      endHour: Math.max(nextEnd, startHour),
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Hour range</span>
        <span className="font-medium text-foreground">
          {formatHourLabel(startHour)} – {formatHourLabel(endHour)}
        </span>
      </div>

      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent/70"
          style={{
            left: `${startPercent}%`,
            width: `${Math.max(endPercent - startPercent, 0)}%`,
          }}
        />

        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={startHour}
          onChange={(event) => updateStart(Number(event.target.value))}
          aria-label="Start hour"
          className="hour-range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
        />
        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={endHour}
          onChange={(event) => updateEnd(Number(event.target.value))}
          aria-label="End hour"
          className="hour-range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>12AM</span>
        <span>12PM</span>
        <span>11PM</span>
      </div>
    </div>
  );
}
