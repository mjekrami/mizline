"use client";

import type { AnalyticsDailySnapshot } from "@mizline/shared";
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatShortDate } from "@/lib/admin/analytics-format";
import {
  analyticsAccentStroke,
  analyticsAxisTickStyle,
  analyticsDotProps,
  analyticsGridStroke,
  ANALYTICS_CHART_MARGIN,
} from "@/lib/admin/analytics-recharts";

interface SalesOverTimeChartProps {
  dailySales: AnalyticsDailySnapshot[];
}

export function SalesOverTimeChart({ dailySales }: SalesOverTimeChartProps) {
  const gradientId = useId().replace(/:/g, "");

  const chartData = useMemo(
    () =>
      dailySales.map((day) => ({
        ...day,
        label: formatShortDate(day.date),
      })),
    [dailySales],
  );

  return (
    <div className="h-52 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ ...ANALYTICS_CHART_MARGIN, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={analyticsAccentStroke} stopOpacity={0.24} />
              <stop offset="100%" stopColor={analyticsAccentStroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={analyticsGridStroke}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={analyticsAxisTickStyle}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={analyticsAxisTickStyle}
            width={48}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <Area
            type="monotone"
            dataKey="revenueCents"
            stroke={analyticsAccentStroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={analyticsDotProps}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
