"use client";

import type { Order } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { Clock3 } from "lucide-react";
import { formatWaitTime } from "@mizline/shared";
import { cn } from "@/lib/utils";

interface WaiterOrderCardProps {
  order: Order;
  now: number;
}

export function WaiterOrderCard({ order, now }: WaiterOrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const waitLabel = formatWaitTime(order.createdAt, now);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{order.tableName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
            statusBadgeClass(order.status),
          )}
        >
          {orderStatusLabels[order.status]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock3 className="size-4" />
        <span>Waiting {waitLabel}</span>
      </div>

      <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
        {order.items.slice(0, 4).map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span>
              {item.quantity}× {item.productName}
              {item.variantName ? ` (${item.variantName})` : ""}
            </span>
          </li>
        ))}
        {order.items.length > 4 ? (
          <li className="text-muted-foreground">
            +{order.items.length - 4} more
          </li>
        ) : null}
      </ul>
    </article>
  );
}

function statusBadgeClass(status: Order["status"]): string {
  switch (status) {
    case "new":
      return "bg-order-new/10 text-order-new";
    case "preparing":
      return "bg-order-preparing/10 text-order-preparing";
    case "ready":
      return "bg-order-ready/10 text-order-ready";
    default:
      return "bg-muted text-muted-foreground";
  }
}
