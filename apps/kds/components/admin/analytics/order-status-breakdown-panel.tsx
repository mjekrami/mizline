import type { AnalyticsStatusShare } from "@mizline/shared";
import {
  AnalyticsSectionCard,
  AnalyticsSectionSelect,
} from "@/components/admin/analytics/analytics-section-card";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  completed: "bg-success",
  inProgress: "bg-warning",
  canceled: "bg-error",
} as const;

interface OrderStatusBreakdownPanelProps {
  statuses: AnalyticsStatusShare[];
  totalOrders: number;
}

export function OrderStatusBreakdownPanel({
  statuses,
  totalOrders,
}: OrderStatusBreakdownPanelProps) {
  const maxCount = Math.max(1, ...statuses.map((status) => status.orderCount));

  return (
    <AnalyticsSectionCard
      title="Order Status Breakdown"
      action={<AnalyticsSectionSelect label="By orders" />}
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">{totalOrders}</span>
        </div>
      }
    >
      <ul className="space-y-4">
        {statuses.map((status) => (
          <li key={status.key} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{status.label}</span>
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{status.orderCount}</span>
                {" · "}
                {status.percentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", STATUS_COLORS[status.key])}
                style={{ width: `${(status.orderCount / maxCount) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </AnalyticsSectionCard>
  );
}
