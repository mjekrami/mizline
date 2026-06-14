"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { OrderTrackingStepper } from "@/components/admin/order-tracking-stepper";
import {
  type OrderStatusFilter,
  useAdminOrders,
} from "@/hooks/use-admin-orders";
import {
  formatOrderNumber,
  formatPrice,
  formatWaitTime,
} from "@/lib/format";
import { getAdvanceActionLabel } from "@/lib/order-status";
import { cn } from "@/lib/utils";

interface AdminOrdersPanelProps {
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
}

const FILTER_OPTIONS: { id: OrderStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "fulfilled", label: "Fulfilled" },
];

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AdminOrdersPanel({
  orders,
  onOrdersChange,
}: AdminOrdersPanelProps) {
  const {
    orders: filteredOrders,
    selectedOrder,
    selectedOrderId,
    setSelectedOrderId,
    statusFilter,
    setStatusFilter,
    statusCounts,
    advancingId,
    fulfillingItemId,
    now,
    advanceOrder,
    fulfillItem,
  } = useAdminOrders({ orders, onOrdersChange });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Orders
          </p>
          <p className="text-sm text-foreground">
            Track and manage table orders in real time
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ id, label }) => {
          const count = statusCounts[id];
          const active = statusFilter === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setStatusFilter(id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition",
                active
                  ? "border-foreground/20 bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {label}
              <span className="rounded-full bg-background px-1.5 py-0.5 font-mono text-[10px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="admin-panel overflow-hidden xl:col-span-5">
          <header className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              {statusFilter === "all"
                ? "All orders"
                : orderStatusLabels[statusFilter as OrderStatus]}
            </p>
            <p className="text-xs text-muted-foreground">
              {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
            </p>
          </header>

          <ul className="max-h-[36rem] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                No orders match this filter.
              </li>
            ) : (
              filteredOrders.map((order) => {
                const selected = selectedOrderId === order.id;

                return (
                  <li key={order.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition last:border-b-0",
                        selected
                          ? "bg-muted/60"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold">
                            #{formatOrderNumber(order.id)}
                          </span>
                          <AdminStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-sm text-foreground">
                          Table {order.tableName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item
                          {order.items.length === 1 ? "" : "s"} ·{" "}
                          {formatPrice(order.total)} · {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <OrderTrackingStepper status={order.status} compact />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="admin-panel flex flex-col gap-4 p-4 xl:col-span-7">
          {selectedOrder ? (
            <OrderDetail
              order={selectedOrder}
              now={now}
              advancing={advancingId === selectedOrder.id}
              fulfillingItemId={fulfillingItemId}
              onAdvance={advanceOrder}
              onFulfillItem={fulfillItem}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                Select an order to track
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Choose an order from the list to view its status timeline, items,
                and staff actions.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface OrderDetailProps {
  order: Order;
  now: number;
  advancing: boolean;
  fulfillingItemId: string | null;
  onAdvance: (order: Order) => void;
  onFulfillItem: (order: Order, itemId: string) => void;
}

function OrderDetail({
  order,
  now,
  advancing,
  fulfillingItemId,
  onAdvance,
  onFulfillItem,
}: OrderDetailProps) {
  const actionLabel = getAdvanceActionLabel(order.status);
  const pendingItems = order.items.filter((item) => !item.fulfilled);
  const canHandOffItems = order.status === "ready" && pendingItems.length > 0;

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-lg font-semibold">
              #{formatOrderNumber(order.id)}
            </h2>
            <AdminStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Table {order.tableName} · {formatPrice(order.total)} ·{" "}
            {formatWaitTime(order.createdAt, now)} wait
          </p>
        </div>

        {actionLabel ? (
          <button
            type="button"
            disabled={advancing}
            onClick={() => onAdvance(order)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {advancing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {actionLabel}
          </button>
        ) : null}
      </header>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Status timeline
        </p>
        <OrderTrackingStepper status={order.status} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Items
          </p>
          {canHandOffItems ? (
            <p className="text-xs text-muted-foreground">
              {pendingItems.length} remaining
            </p>
          ) : null}
        </div>

        <ul className="flex flex-col gap-2">
          {order.items.map((item) => {
            const handingOff = fulfillingItemId === item.id;

            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm",
                  item.fulfilled
                    ? "border-success/30 bg-success/5"
                    : "border-border/60 bg-background/40",
                )}
              >
                <div className={cn(item.fulfilled && "text-muted-foreground")}>
                  <span className="font-medium">
                    {item.quantity}× {item.productName}
                  </span>
                  {item.variantName ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {item.variantName}
                    </span>
                  ) : null}
                  {item.modifiers.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {item.modifiers.map((mod) => mod.optionName).join(", ")}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="text-xs italic text-muted-foreground">
                      {item.notes}
                    </p>
                  ) : null}
                  {item.fulfilled ? (
                    <p className="text-xs text-success">Handed off</p>
                  ) : order.status === "ready" ? (
                    <p className="text-xs text-muted-foreground">Awaiting hand-off</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  {item.fulfilled ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : canHandOffItems ? (
                    <button
                      type="button"
                      disabled={handingOff}
                      onClick={() => onFulfillItem(order, item.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {handingOff ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : null}
                      Hand off
                    </button>
                  ) : null}
                  <span className="font-mono text-xs">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
