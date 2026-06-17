"use client";

import type { SalesAnalyticsDashboard } from "@mizline/shared";
import { formatPrice } from "@mizline/shared";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsHeader } from "@/components/admin/analytics/analytics-header";
import { AnalyticsKpiCard } from "@/components/admin/analytics/analytics-kpi-card";
import {
  AnalyticsSectionCard,
  AnalyticsSectionSelect,
} from "@/components/admin/analytics/analytics-section-card";
import { CategoryBreakdownPanel } from "@/components/admin/analytics/category-breakdown-panel";
import { ChannelBreakdownPanel } from "@/components/admin/analytics/channel-breakdown-panel";
import { DailyPerformanceTable } from "@/components/admin/analytics/daily-performance-table";
import { OrderStatusBreakdownPanel } from "@/components/admin/analytics/order-status-breakdown-panel";
import { PeakHoursChart } from "@/components/admin/analytics/peak-hours-chart";
import { SalesOverTimeChart } from "@/components/admin/analytics/sales-over-time-chart";
import { TopSellingItemsPanel } from "@/components/admin/analytics/top-selling-items-panel";
import { TrendBadge } from "@/components/admin/analytics/trend-badge";
import {
  defaultAnalyticsRange,
  formatComparisonLabel,
  type AnalyticsDatePresetId,
  type AnalyticsDateRangeSelection,
} from "@/lib/admin/analytics-format";
import { fetchSalesAnalytics } from "@/lib/api/reports";

export function ReportsPanel() {
  const initialRange = useMemo(() => defaultAnalyticsRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [activePreset, setActivePreset] = useState<AnalyticsDatePresetId | null>("7d");
  const [analytics, setAnalytics] = useState<SalesAnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const comparisonLabel = useMemo(
    () => (analytics ? formatComparisonLabel(analytics.range) : ""),
    [analytics],
  );

  const totalOrders = useMemo(
    () =>
      analytics?.statusBreakdown.reduce(
        (sum, status) => sum + status.orderCount,
        0,
      ) ?? 0,
    [analytics],
  );

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextAnalytics = await fetchSalesAnalytics(startDate, endDate);
      setAnalytics(nextAnalytics);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    setActivePreset(null);
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setEndDate(value);
    setActivePreset(null);
  }, []);

  const handlePresetSelect = useCallback(
    (range: AnalyticsDateRangeSelection, presetId: AnalyticsDatePresetId) => {
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      setActivePreset(presetId);
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    const range = defaultAnalyticsRange();
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setActivePreset("7d");
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsHeader
        startDate={startDate}
        endDate={endDate}
        activePreset={activePreset}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onPresetSelect={handlePresetSelect}
        onResetFilters={handleResetFilters}
      />

      {error ? (
        <p className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading analytics…
        </div>
      ) : analytics ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsKpiCard
              label="Sales Overview"
              value={formatPrice(analytics.revenueCents)}
              trend={analytics.revenueChangePercent}
              comparisonLabel={comparisonLabel}
              sparkline={analytics.revenueSparkline}
            />
            <AnalyticsKpiCard
              label="Orders"
              value={analytics.orderCount.toString()}
              trend={analytics.orderCountChangePercent}
              comparisonLabel={comparisonLabel}
              sparkline={analytics.ordersSparkline}
            />
            <AnalyticsKpiCard
              label="Avg. Order Value"
              value={
                analytics.averageTicketCents != null
                  ? formatPrice(analytics.averageTicketCents)
                  : "—"
              }
              trend={analytics.averageTicketChangePercent}
              comparisonLabel={comparisonLabel}
              sparkline={analytics.averageTicketSparkline}
            />
            <AnalyticsKpiCard
              label="Items Sold"
              value={analytics.itemsSold.toLocaleString()}
              trend={analytics.itemsSoldChangePercent}
              comparisonLabel={comparisonLabel}
              sparkline={analytics.itemsSoldSparkline}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <AnalyticsSectionCard
              title="Sales Over Time"
              action={<AnalyticsSectionSelect label="Daily" />}
              className="xl:col-span-2"
            >
              <div className="mb-5 space-y-1">
                <p className="font-mono text-3xl font-semibold tracking-tight">
                  {formatPrice(analytics.revenueCents)}
                </p>
                <TrendBadge
                  value={analytics.revenueChangePercent}
                  label={comparisonLabel}
                />
              </div>
              <SalesOverTimeChart dailySales={analytics.dailySales} />
            </AnalyticsSectionCard>

            <CategoryBreakdownPanel categories={analytics.categoryBreakdown} />
          </section>

          <section className="grid items-stretch gap-4 xl:grid-cols-2">
            <TopSellingItemsPanel items={analytics.topSellingItems} />
            <PeakHoursChart entries={analytics.peakHours} />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChannelBreakdownPanel
              channels={analytics.channelBreakdown}
              totalOrders={totalOrders}
            />
            <OrderStatusBreakdownPanel
              statuses={analytics.statusBreakdown}
              totalOrders={totalOrders}
            />
          </section>

          <DailyPerformanceTable
            dailySales={analytics.dailySales}
            totals={{
              orderCount: analytics.orderCount,
              revenueCents: analytics.revenueCents,
              averageTicketCents: analytics.averageTicketCents,
              itemsSold: analytics.itemsSold,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
