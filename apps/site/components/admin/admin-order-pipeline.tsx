import type { OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { orderStatusBarColors } from "@/constants/order-status-colors";
import type { AdminDashboardStats } from "@/lib/admin-stats";
import { cn } from "@/lib/utils";

interface AdminOrderPipelineProps {
  stats: AdminDashboardStats;
  totalTrackedOrders: number;
}

export function AdminOrderPipeline({
  stats,
  totalTrackedOrders,
}: AdminOrderPipelineProps) {
  const statuses = Object.keys(stats.ordersByStatus) as OrderStatus[];

  return (
    <section className="admin-panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pipeline
          </p>
          <p className="text-sm text-foreground">Orders by status</p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {totalTrackedOrders} total
        </p>
      </div>

      <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-muted">
        {statuses.map((status) => {
          const count = stats.ordersByStatus[status];
          if (count === 0 || totalTrackedOrders === 0) return null;

          return (
            <div
              key={status}
              className={cn("h-full", orderStatusBarColors[status])}
              style={{
                width: `${(count / totalTrackedOrders) * 100}%`,
              }}
              title={`${orderStatusLabels[status]}: ${count}`}
            />
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {statuses.map((status) => (
          <div
            key={status}
            className="rounded-md border border-border/60 bg-background/40 px-3 py-2"
          >
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {orderStatusLabels[status]}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {stats.ordersByStatus[status]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
