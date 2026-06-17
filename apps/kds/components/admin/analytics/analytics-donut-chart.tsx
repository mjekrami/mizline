"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ANALYTICS_SEGMENT_COLORS } from "@/lib/admin/analytics-chart";

export interface AnalyticsDonutDatum {
  key: string;
  value: number;
}

interface AnalyticsDonutChartProps {
  data: AnalyticsDonutDatum[];
  emptyLabel: string;
  className?: string;
}

export function AnalyticsDonutChart({
  data,
  emptyLabel,
  className,
}: AnalyticsDonutChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground",
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius="62%"
            outerRadius="100%"
            stroke="none"
            paddingAngle={data.length > 1 ? 2 : 0}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.key}
                fill={ANALYTICS_SEGMENT_COLORS[index % ANALYTICS_SEGMENT_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
