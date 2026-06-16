"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { getWaitUrgency, orderStatusLabels } from "@mizline/shared";
import { UserRound } from "lucide-react";
import { OrderAdvanceButton } from "@/components/order/order-advance-button";
import { OrderInstructions } from "@/components/order/order-instructions";
import { OrderItemsList } from "@/components/order/order-items-list";
import { WaitBadge } from "@/components/ui/wait-badge";
import {
  canHandOffOrderItems,
  getPendingOrderItems,
} from "@/lib/order-display";
import { formatOrderNumber, formatPrice } from "@/lib/format";
import { getAdvanceActionLabel } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const columnAccent: Record<OrderStatus, string> = {
  new: "border-order-new text-order-new",
  preparing: "border-order-preparing text-order-preparing",
  ready: "border-order-ready text-order-ready",
  fulfilled: "border-order-fulfilled text-order-fulfilled",
  cancelled: "border-order-cancelled text-order-cancelled",
};

const urgencyCardStyles = {
  normal: "",
  warning: "ring-1 ring-order-preparing/40 bg-order-preparing-soft/20",
  critical: "ring-2 ring-order-cancelled/50 bg-order-cancelled-soft/20",
} as const;

interface OrderCardProps {
  order: Order;
  now: number;
  advancing: boolean;
  fulfillingItemId: string | null;
  delayWarningMinutes: number;
  delayCriticalMinutes: number;
  onAdvance: (order: Order) => void;
  onFulfillItem: (order: Order, itemId: string) => void;
}

export function OrderCard({
  order,
  now,
  advancing,
  fulfillingItemId,
  delayWarningMinutes,
  delayCriticalMinutes,
  onAdvance,
  onFulfillItem,
}: OrderCardProps) {
  const pendingItems = getPendingOrderItems(order);
  const canHandOffItems = canHandOffOrderItems(order);
  const actionLabel = getAdvanceActionLabel(order.status);
  const showUrgency =
    order.status === "new" ||
    order.status === "preparing" ||
    order.status === "ready";
  const urgency = showUrgency
    ? getWaitUrgency(order.createdAt, now, {
        warningMinutes: delayWarningMinutes,
        criticalMinutes: delayCriticalMinutes,
      })
    : "normal";

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm",
        columnAccent[order.status],
        "border-t-4",
        showUrgency && urgencyCardStyles[urgency],
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            #{formatOrderNumber(order.id)}
          </p>
          <p className="text-sm text-muted-foreground">
            Table {order.tableName}
          </p>
          {order.assignedTo ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <UserRound className="size-3.5" />
              {order.assignedTo.name}
            </p>
          ) : null}
        </div>
        <WaitBadge
          createdAt={order.createdAt}
          now={now}
          thresholds={{
            warningMinutes: delayWarningMinutes,
            criticalMinutes: delayCriticalMinutes,
          }}
          className="px-2 py-1 text-xs"
        />
      </header>

      <OrderItemsList
        order={order}
        variant="kitchen"
        fulfillingItemId={fulfillingItemId}
        onFulfillItem={onFulfillItem}
      />

      <OrderInstructions order={order} />

      <footer className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="text-sm font-medium">{formatPrice(order.total)}</span>
        {actionLabel ? (
          <OrderAdvanceButton
            order={order}
            advancing={advancing}
            onAdvance={onAdvance}
          />
        ) : canHandOffItems ? (
          <span className="text-xs font-medium text-muted-foreground">
            {pendingItems.length} item{pendingItems.length === 1 ? "" : "s"}{" "}
            remaining
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {orderStatusLabels[order.status]}
          </span>
        )}
      </footer>
    </article>
  );
}
