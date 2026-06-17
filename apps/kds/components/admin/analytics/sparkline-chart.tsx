"use client";

import { useId, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  analyticsAccentStroke,
  ANALYTICS_CHART_MARGIN,
} from "@/lib/admin/analytics-recharts";

interface SparklineChartProps {
  values: number[];
  className?: string;
}

export function SparklineChart({ values, className }: SparklineChartProps) {
  const gradientId = useId().replace(/:/g, "");

  const chartData = useMemo(
    () => values.map((value, index) => ({ index, value })),
    [values],
  );

  if (chartData.length === 0) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={ANALYTICS_CHART_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={analyticsAccentStroke} stopOpacity={0.18} />
              <stop offset="100%" stopColor={analyticsAccentStroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={analyticsAccentStroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
