"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { ArrowLeft, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getOrder } from "@/lib/api/customer";
import { formatPrice } from "@/lib/format";
import { addOrderRef } from "@/lib/order/storage";
import { useCustomerOrderRealtime } from "@/hooks/use-customer-order-realtime";
import {
  OrderModifySheet,
  OrderModifyTrigger,
} from "@/components/order/order-modify-sheet";
import { cn } from "@/lib/utils";

const TRACKING_STEPS: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "fulfilled",
];

const stepAccent: Record<OrderStatus, string> = {
  new: "border-order-new text-order-new",
  preparing: "border-order-preparing text-order-preparing",
  ready: "border-order-ready text-order-ready",
  fulfilled: "border-order-fulfilled text-order-fulfilled",
  cancelled: "border-order-cancelled text-order-cancelled",
};

function stepIndex(status: OrderStatus): number {
  return TRACKING_STEPS.indexOf(status);
}

interface OrderTrackingProps {
  initialOrder: Order;
  storeId: string;
  tableId: string;
}

export function OrderTracking({
  initialOrder,
  storeId,
  tableId,
}: OrderTrackingProps) {
  const [order, setOrder] = useState(initialOrder);
  const [refreshing, setRefreshing] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    addOrderRef(storeId, tableId, initialOrder.id, initialOrder.createdAt);
  }, [initialOrder.createdAt, initialOrder.id, storeId, tableId]);

  const refreshOrder = useCallback(async () => {
    setRefreshing(true);
    try {
      const latest = await getOrder(initialOrder.id);
      setOrder(latest);
    } finally {
      setRefreshing(false);
    }
  }, [initialOrder.id]);

  useCustomerOrderRealtime({
    storeId,
    orderIds: [initialOrder.id],
    onStatusUpdate: () => {
      void refreshOrder();
    },
  });

  const currentStep = stepIndex(order.status);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 pb-10">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/store/${storeId}/table/${tableId}`}
            className="customer-nav-link"
          >
            <ArrowLeft className="size-4" />
            Menu
          </Link>
          <Link
            href={`/store/${storeId}/table/${tableId}/orders`}
            className="customer-nav-link"
          >
            My orders
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Order received
          </h1>
          {refreshing ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <p className="text-muted-foreground">
          Table {order.tableName} ·{" "}
          <span className="font-bold customer-text-accent">
            {formatPrice(order.total)}
          </span>
        </p>
        <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Pay at the counter when you&apos;re ready — no online payment.
        </p>
        <OrderModifyTrigger
          order={order}
          mode="customer"
          className="customer-nav-link self-start px-4 py-2.5"
          onClick={() => setModifyOpen(true)}
        />
      </header>

      <ol className="flex flex-col gap-3">
        {TRACKING_STEPS.map((status, index) => {
          const done = currentStep > index;
          const active = currentStep === index;
          const upcoming = currentStep < index;

          return (
            <li
              key={status}
              className={cn(
                "customer-product-card flex items-center gap-3 rounded-2xl px-4 py-4",
                active && `border-l-4 ${stepAccent[status]}`,
                upcoming && "opacity-45",
              )}
            >
              {done ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" />
              ) : active ? (
                <Clock3 className={cn("size-5 shrink-0", stepAccent[status])} />
              ) : (
                <span className="size-5 shrink-0 rounded-full border-2 border-border" />
              )}
              <div>
                <p className="font-semibold">{orderStatusLabels[status]}</p>
                {active && status === "new" ? (
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve received your order.
                  </p>
                ) : null}
                {active && status === "preparing" ? (
                  <p className="text-sm text-muted-foreground">
                    Your order is being prepared.
                  </p>
                ) : null}
                {active && status === "ready" ? (
                  <p className="text-sm text-muted-foreground">
                    Ready for pickup at your table.
                  </p>
                ) : null}
                {active && status === "fulfilled" ? (
                  <p className="text-sm text-muted-foreground">
                    Enjoy your order!
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="customer-product-card rounded-2xl p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Items
        </h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-sm",
                item.fulfilled
                  ? "bg-success/10"
                  : "bg-secondary/60",
              )}
            >
              <div className={cn(item.fulfilled && "text-muted-foreground")}>
                <span className="font-semibold">
                  {item.quantity}× {item.productName}
                </span>
                {item.variantName ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {item.variantName}
                  </span>
                ) : null}
                {item.modifiers && item.modifiers.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {item.modifiers.map((modifier) => modifier.optionName).join(", ")}
                  </p>
                ) : null}
                {item.notes ? (
                  <p className="text-xs text-muted-foreground italic">
                    {item.notes}
                  </p>
                ) : null}
                {item.fulfilled ? (
                  <p className="text-xs font-medium text-success">Handed off</p>
                ) : order.status === "ready" ? (
                  <p className="text-xs text-muted-foreground">Ready for pickup</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {item.fulfilled ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : null}
                <span className="font-bold customer-text-accent">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <OrderModifySheet
        order={order}
        storeId={storeId}
        tableId={tableId}
        mode="customer"
        open={modifyOpen}
        onClose={() => setModifyOpen(false)}
        onOrderUpdated={setOrder}
      />
    </div>
  );
}
