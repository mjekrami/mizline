"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMyOrders } from "@/hooks/use-my-orders";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-order-new/10 text-order-new",
  preparing: "bg-order-preparing/10 text-order-preparing",
  ready: "bg-order-ready/10 text-order-ready",
  fulfilled: "bg-order-fulfilled/10 text-order-fulfilled",
  cancelled: "bg-order-cancelled/10 text-order-cancelled",
};

function formatOrderTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function itemSummary(order: Order): string {
  const [first, ...rest] = order.items;
  if (!first) return "No items";

  const label = `${first.quantity}× ${first.productName}`;
  if (rest.length === 0) return label;
  return `${label} +${rest.length} more`;
}

interface MyOrdersProps {
  storeId: string;
  tableId: string;
}

interface MyOrdersViewProps extends MyOrdersProps {
  orders: Order[];
  activeOrders: Order[];
  loading: boolean;
  refreshing: boolean;
}

export function MyOrdersNav({
  storeId,
  tableId,
  orders,
  loading,
}: Pick<MyOrdersViewProps, "storeId" | "tableId" | "orders" | "loading">) {
  if (loading || orders.length === 0) {
    return null;
  }

  return (
    <Link
      href={`/store/${storeId}/table/${tableId}/orders`}
      className="text-sm font-medium text-primary hover:underline"
    >
      My orders ({orders.length})
    </Link>
  );
}

export function MyOrdersBanner({
  storeId,
  tableId,
  activeOrders,
  refreshing,
}: Pick<
  MyOrdersViewProps,
  "storeId" | "tableId" | "activeOrders" | "refreshing"
>) {
  if (activeOrders.length === 0) {
    return null;
  }

  const order = activeOrders[0];

  return (
    <Link
      href={`/store/${storeId}/table/${tableId}/order/${order.id}`}
      className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {activeOrders.length === 1
            ? "Your order is in progress"
            : `${activeOrders.length} orders in progress`}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {itemSummary(order)} · {formatPrice(order.total)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {refreshing ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyles[order.status],
          )}
        >
          {orderStatusLabels[order.status]}
        </span>
      </div>
    </Link>
  );
}

export function MyOrdersList({ storeId, tableId }: MyOrdersProps) {
  const { orders, loading, refreshing } = useMyOrders(storeId, tableId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <p className="text-lg font-medium">No orders yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Orders you place from this table will appear here on this device.
        </p>
        <Link
          href={`/store/${storeId}/table/${tableId}`}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your orders
        </h2>
        {refreshing ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/store/${storeId}/table/${tableId}/order/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30"
            >
              <div className="min-w-0">
                <p className="font-medium">{itemSummary(order)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatOrderTime(order.createdAt)} · {formatPrice(order.total)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  statusStyles[order.status],
                )}
              >
                {orderStatusLabels[order.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { useMyOrders };
