"use client";

import type { HourlyActivityEntry } from "@mizline/shared";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  HourRangeSlider,
  type HourRange,
} from "@/components/admin/analytics/hour-range-slider";
import {
  AnalyticsSectionCard,
  AnalyticsSectionSelect,
} from "@/components/admin/analytics/analytics-section-card";
import { formatHourLabel } from "@/lib/admin/analytics-format";
import {
  analyticsAccentStroke,
  analyticsAxisTickStyle,
  analyticsGridStroke,
  ANALYTICS_CHART_MARGIN,
} from "@/lib/admin/analytics-recharts";

const BUCKET_SIZE_HOURS = 3;
const DEFAULT_HOUR_RANGE: HourRange = { startHour: 0, endHour: 23 };

interface PeakHoursChartProps {
  entries: HourlyActivityEntry[];
}

function bucketPeakHoursInRange(
  entries: HourlyActivityEntry[],
  startHour: number,
  endHour: number,
) {
  const buckets: Array<{ label: string; orderCount: number }> = [];

  for (let bucketStart = startHour; bucketStart <= endHour; bucketStart += BUCKET_SIZE_HOURS) {
    const bucketEnd = Math.min(bucketStart + BUCKET_SIZE_HOURS - 1, endHour);
    const orderCount = entries
      .filter((entry) => entry.hour >= bucketStart && entry.hour <= bucketEnd)
      .reduce((sum, entry) => sum + entry.orderCount, 0);

    buckets.push({
      label: formatHourLabel(bucketStart),
      orderCount,
    });
  }

  return buckets;
}

export function PeakHoursChart({ entries }: PeakHoursChartProps) {
  const [hourRange, setHourRange] = useState<HourRange>(DEFAULT_HOUR_RANGE);

  const chartData = useMemo(
    () => bucketPeakHoursInRange(entries, hourRange.startHour, hourRange.endHour),
    [entries, hourRange],
  );

  const peakOrders = useMemo(
    () => Math.max(1, ...chartData.map((bucket) => bucket.orderCount)),
    [chartData],
  );

  return (
    <AnalyticsSectionCard
      title="Peak Hours"
      action={<AnalyticsSectionSelect label="By orders" />}
      className="h-full"
      bodyClassName="min-h-0"
    >
      <div className="flex min-h-64 flex-1 flex-col gap-4">
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ ...ANALYTICS_CHART_MARGIN, left: 4, bottom: 4, top: 4 }}
              barCategoryGap="18%"
            >
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
                interval={0}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={analyticsAxisTickStyle}
                width={32}
                allowDecimals={false}
                domain={[0, peakOrders]}
                tickCount={4}
              />
              <Bar
                dataKey="orderCount"
                fill={analyticsAccentStroke}
                fillOpacity={0.85}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <HourRangeSlider value={hourRange} onChange={setHourRange} />
      </div>
    </AnalyticsSectionCard>
  );
}
