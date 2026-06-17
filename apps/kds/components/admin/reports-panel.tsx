"use client";

import type { DailySalesSummary, HourlyActivityReport } from "@mizline/shared";
import { BarChart3, Loader2, Receipt, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import {
  fetchDailySummary,
  fetchHourlyActivity,
} from "@/lib/api/reports";
import { formatPrice } from "@mizline/shared";

function todayInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function ReportsPanel() {
  const [date, setDate] = useState(todayInputValue);
  const [summary, setSummary] = useState<DailySalesSummary | null>(null);
  const [activity, setActivity] = useState<HourlyActivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maxOrders = useMemo(
    () => Math.max(1, ...(activity?.entries.map((entry) => entry.orderCount) ?? [1])),
    [activity],
  );

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextSummary, nextActivity] = await Promise.all([
        fetchDailySummary(date),
        fetchHourlyActivity(date),
      ]);
      setSummary(nextSummary);
      setActivity(nextActivity);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load reports",
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Daily sales and hourly order activity for staffing decisions.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
      </div>

      {error ? (
        <p className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading reports…
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminMetricCard
              label="Revenue"
              value={formatPrice(summary?.revenueCents ?? 0)}
              icon={Receipt}
            />
            <AdminMetricCard
              label="Orders"
              value={(summary?.orderCount ?? 0).toString()}
              icon={ShoppingBag}
            />
            <AdminMetricCard
              label="Average ticket"
              value={
                summary?.averageTicketCents != null
                  ? formatPrice(summary.averageTicketCents)
                  : "—"
              }
              icon={BarChart3}
            />
          </div>

          <section className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Hourly activity
            </h3>
            <div className="grid grid-cols-6 gap-2 md:grid-cols-12 xl:grid-cols-24">
              {activity?.entries.map((entry) => {
                const intensity = entry.orderCount / maxOrders;

                return (
                  <div
                    key={entry.hour}
                    title={`${entry.hour}:00 — ${entry.orderCount} orders, ${formatPrice(entry.revenueCents)}`}
                    className="flex min-h-16 flex-col justify-end rounded-md border border-border p-2"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-accent) ${Math.round(intensity * 55)}%, var(--card))`,
                    }}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {entry.hour}:00
                    </span>
                    <span className="text-sm font-semibold">{entry.orderCount}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
