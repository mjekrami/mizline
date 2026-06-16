"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMyOrders } from "@/hooks/use-my-orders";
import { formatPrice } from "@mizline/shared";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-order-new/15 text-order-new",
  preparing: "bg-order-preparing/15 text-order-preparing",
  ready: "bg-order-ready/15 text-order-ready",
  fulfilled: "bg-order-fulfilled/15 text-order-fulfilled",
  cancelled: "bg-order-cancelled/15 text-order-cancelled",
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

interface MyOrdersBannerProps {
  storeId: string;
  tableId: string;
  activeOrders: Order[];
  refreshing: boolean;
}

export function MyOrdersBanner({
  storeId,
  tableId,
  activeOrders,
  refreshing,
}: MyOrdersBannerProps) {
  if (activeOrders.length === 0) {
    return null;
  }

  const order = activeOrders[0];

  return (
    <Link
      href={`/store/${storeId}/table/${tableId}/order/${order.id}`}
      className="customer-order-banner flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-opacity hover:opacity-95"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">
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
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            statusStyles[order.status],
          )}
        >
          {orderStatusLabels[order.status]}
        </span>
      </div>
    </Link>
  );
}

interface MyOrdersListProps {
  storeId: string;
  tableId: string;
}

export function MyOrdersList({ storeId, tableId }: MyOrdersListProps) {
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
        <p className="text-lg font-bold">No orders yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Orders you place from this table will appear here on this device.
        </p>
        <Link
          href={`/store/${storeId}/table/${tableId}`}
          className="customer-btn-primary mt-4 rounded-2xl px-5 py-3 text-sm font-bold"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
              className="customer-product-card flex items-center justify-between gap-3 rounded-2xl px-4 py-4 transition-transform active:scale-[0.98]"
            >
              <div className="min-w-0">
                <p className="font-semibold">{itemSummary(order)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatOrderTime(order.createdAt)} · {formatPrice(order.total)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
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
