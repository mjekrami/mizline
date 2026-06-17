"use client";

import type { AnalyticsChannelShare } from "@mizline/shared";
import { AnalyticsDonutChart } from "@/components/admin/analytics/analytics-donut-chart";
import {
  AnalyticsSectionCard,
  AnalyticsSectionSelect,
} from "@/components/admin/analytics/analytics-section-card";
import { ANALYTICS_SEGMENT_COLORS } from "@/lib/admin/analytics-chart";

interface ChannelBreakdownPanelProps {
  channels: AnalyticsChannelShare[];
  totalOrders: number;
}

export function ChannelBreakdownPanel({
  channels,
  totalOrders,
}: ChannelBreakdownPanelProps) {
  const donutData = channels.map((channel) => ({
    key: channel.channel,
    value: channel.percentage,
  }));

  return (
    <AnalyticsSectionCard
      title="Orders by Channel"
      action={<AnalyticsSectionSelect label="By orders" />}
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">{totalOrders}</span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <AnalyticsDonutChart
          data={donutData}
          emptyLabel="No orders"
          className="size-32"
        />

        <ul className="min-w-0 flex-1 space-y-3">
          {channels.length > 0 ? (
            channels.map((channel, index) => (
              <li key={channel.channel} className="flex items-center justify-between gap-3">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: ANALYTICS_SEGMENT_COLORS[index % ANALYTICS_SEGMENT_COLORS.length] }}
                  />
                  <span className="truncate text-sm font-medium">{channel.channel}</span>
                </span>
                <span className="shrink-0 text-sm">
                  <span className="font-semibold">{channel.percentage}%</span>
                  <span className="ml-2 text-muted-foreground">{channel.orderCount}</span>
                </span>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">No channel data yet</li>
          )}
        </ul>
      </div>
    </AnalyticsSectionCard>
  );
}
