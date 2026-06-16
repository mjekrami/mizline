"use client";

import type {
  AdminCatalog,
  AdminTable,
  DailySalesSummary,
  KitchenMetrics,
  Order,
} from "@mizline/shared";
import {
  CheckCircle2,
  Clock3,
  Hourglass,
  Receipt,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminActivityLog } from "@/components/admin/admin-activity-log";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminOrderPipeline } from "@/components/admin/admin-order-pipeline";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { AdminStoreSnapshot } from "@/components/admin/admin-store-snapshot";
import { StoreSettingsPanel } from "@/components/admin/store-settings-panel";
import {
  buildActivityLog,
  type AdminDashboardStats,
} from "@/lib/admin/dashboard";
import { countTrackedOrders } from "@/lib/admin/dashboard";
import { fetchDailySummary } from "@/lib/api/reports";
import { formatPrepTime, formatPrice } from "@/lib/format";

interface AdminOverviewProps {
  catalog: AdminCatalog;
  tables: AdminTable[];
  orders: Order[];
  metrics: KitchenMetrics;
  stats: AdminDashboardStats;
  connected: boolean;
  onOrderSelect: (orderId: string) => void;
}

export function AdminOverview({
  catalog,
  tables,
  orders,
  metrics,
  stats,
  connected,
  onOrderSelect,
}: AdminOverviewProps) {
  const activity = buildActivityLog(orders);
  const totalTrackedOrders = countTrackedOrders(stats.ordersByStatus);
  const [dailySummary, setDailySummary] = useState<DailySalesSummary | null>(null);

  useEffect(() => {
    void fetchDailySummary()
      .then(setDailySummary)
      .catch(() => {
        // Overview still renders operational metrics if reports fail.
      });
  }, [orders]);

  return (
    <div className="flex flex-col gap-4">
      <AdminActivityLog
        entries={activity}
        connected={connected}
        onOrderSelect={onOrderSelect}
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <AdminStoreSnapshot catalog={catalog} stats={stats} tables={tables} />

        <section className="flex flex-col gap-4 xl:col-span-9">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <AdminMetricCard
              label="Orders waiting"
              value={metrics.ordersWaiting.toString()}
              icon={Hourglass}
              tone={metrics.ordersWaiting > 0 ? "warning" : "default"}
            />
            <AdminMetricCard
              label="Avg prep time"
              value={formatPrepTime(metrics.averagePrepTimeSeconds)}
              icon={Clock3}
            />
            <AdminMetricCard
              label="Completed today"
              value={metrics.ordersCompletedToday.toString()}
              icon={CheckCircle2}
              tone="success"
            />
            <AdminMetricCard
              label="Revenue today"
              value={formatPrice(dailySummary?.revenueCents ?? 0)}
              icon={CheckCircle2}
              tone="success"
            />
            <AdminMetricCard
              label="Average ticket"
              value={
                dailySummary?.averageTicketCents != null
                  ? formatPrice(dailySummary.averageTicketCents)
                  : "—"
              }
              icon={Receipt}
            />
          </div>

          <StoreSettingsPanel />

          <AdminOrderPipeline
            stats={stats}
            totalTrackedOrders={totalTrackedOrders}
          />

          <AdminOrdersTable orders={orders} onOrderSelect={onOrderSelect} />
        </section>
      </div>
    </div>
  );
}
