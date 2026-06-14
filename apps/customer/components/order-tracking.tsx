"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { CheckCircle2, Clock3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl, getOrder } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { addOrderRef } from "@/lib/orders";
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

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    addOrderRef(storeId, tableId, initialOrder.id, initialOrder.createdAt);
  }, [initialOrder.createdAt, initialOrder.id, storeId, tableId]);

  useEffect(() => {
    let socket: Socket | null = null;
    let active = true;

    async function connect() {
      socket = io(`${getApiBaseUrl()}/realtime`, {
        query: { storeId },
        transports: ["websocket", "polling"],
      });

      socket.emit("joinOrder", { orderId: initialOrder.id });

      const refresh = async () => {
        if (!active) return;
        setRefreshing(true);
        try {
          const latest = await getOrder(initialOrder.id);
          if (active) setOrder(latest);
        } finally {
          if (active) setRefreshing(false);
        }
      };

      socket.on("order.preparing", refresh);
      socket.on("order.ready", refresh);
      socket.on("order.fulfilled", refresh);
    }

    void connect();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [initialOrder.id, storeId]);

  const currentStep = stepIndex(order.status);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2 pr-12">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link
            href={`/store/${storeId}/table/${tableId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to menu
          </Link>
          <Link
            href={`/store/${storeId}/table/${tableId}/orders`}
            className="text-sm font-medium text-primary hover:underline"
          >
            My orders
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Order received
          </h1>
          {refreshing ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <p className="text-muted-foreground">
          Table {order.tableName} · {formatPrice(order.total)}
        </p>
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
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3",
                active ? `border-l-4 ${stepAccent[status]}` : "border-border",
                upcoming && "opacity-50",
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
                <p className="font-medium">{orderStatusLabels[status]}</p>
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

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Items
        </h2>
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div>
                <span className="font-medium">
                  {item.quantity}× {item.productName}
                </span>
                {item.variantName ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {item.variantName}
                  </span>
                ) : null}
              </div>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
