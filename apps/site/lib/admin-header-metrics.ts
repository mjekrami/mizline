import type { KitchenMetrics } from "@mizline/shared";
import type { AdminDashboardStats } from "@/lib/admin-stats";
import { formatPrepTime, formatPrice } from "@/lib/format";

export interface HeaderMetric {
  label: string;
  value: string;
  tone: string;
}

export function buildHeaderMetrics(
  stats: AdminDashboardStats,
  metrics: KitchenMetrics,
): HeaderMetric[] {
  return [
    {
      label: "Revenue today",
      value: formatPrice(stats.revenueTodayCents),
      tone: "text-success",
    },
    {
      label: "Active orders",
      value: stats.activeOrders.toString(),
      tone: stats.activeOrders > 0 ? "text-warning" : "text-foreground",
    },
    {
      label: "Completed today",
      value: metrics.ordersCompletedToday.toString(),
      tone: "text-foreground",
    },
    {
      label: "Avg prep",
      value: formatPrepTime(metrics.averagePrepTimeSeconds),
      tone: "text-foreground",
    },
  ];
}
