"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { OrderTrackingStepper } from "@/components/admin/order-tracking-stepper";
import { OrderAdvanceButton } from "@/components/order/order-advance-button";
import { OrderItemsList } from "@/components/order/order-items-list";
import {
  type OrderStatusFilter,
  useAdminOrders,
} from "@/hooks/use-admin-orders";
import {
  canHandOffOrderItems,
  getPendingOrderItems,
} from "@/lib/order-display";
import {
  formatOrderNumber,
  formatPrice,
  formatTimeOfDay,
  formatWaitTime,
} from "@/lib/format";
import { VirtualList } from "@/components/ui/virtual-list";
import { cn } from "@/lib/utils";

interface AdminOrdersPanelProps {
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  selectedOrderId: string | null;
  onSelectOrderId: (orderId: string | null) => void;
}

const FILTER_OPTIONS: { id: OrderStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "fulfilled", label: "Fulfilled" },
];

export function AdminOrdersPanel({
  orders,
  onOrdersChange,
  selectedOrderId,
  onSelectOrderId,
}: AdminOrdersPanelProps) {
  const {
    orders: filteredOrders,
    selectedOrder,
    selectedOrderId: activeOrderId,
    setSelectedOrderId,
    statusFilter,
    setStatusFilter,
    statusCounts,
    advancingId,
    fulfillingItemId,
    now,
    advanceOrder,
    fulfillItem,
  } = useAdminOrders({
    orders,
    onOrdersChange,
    selectedOrderId,
    onSelectOrderId,
  });

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

          <VirtualList
            as="ul"
            itemAs="li"
            items={filteredOrders}
            estimateSize={88}
            className="max-h-[36rem]"
            getItemKey={(order) => order.id}
            empty={
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No orders match this filter.
              </p>
            }
            renderItem={(order) => {
              const selected = activeOrderId === order.id;

              return (
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition",
                    selected ? "bg-muted/60" : "hover:bg-muted/30",
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
                      {formatPrice(order.total)} · {formatTimeOfDay(order.createdAt)}
                    </p>
                  </div>
                  <OrderTrackingStepper status={order.status} compact />
                </button>
              );
            }}
          />
        </section>

        <section className="admin-panel flex flex-col gap-4 p-4 xl:col-span-7">
          {selectedOrder ? (
            <AdminOrderDetail
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

interface AdminOrderDetailProps {
  order: Order;
  now: number;
  advancing: boolean;
  fulfillingItemId: string | null;
  onAdvance: (order: Order) => void;
  onFulfillItem: (order: Order, itemId: string) => void;
}

function AdminOrderDetail({
  order,
  now,
  advancing,
  fulfillingItemId,
  onAdvance,
  onFulfillItem,
}: AdminOrderDetailProps) {
  const pendingItems = getPendingOrderItems(order);
  const canHandOffItems = canHandOffOrderItems(order);

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

        <OrderAdvanceButton
          order={order}
          advancing={advancing}
          onAdvance={onAdvance}
          size="md"
        />
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

        <OrderItemsList
          order={order}
          variant="admin"
          fulfillingItemId={fulfillingItemId}
          onFulfillItem={onFulfillItem}
        />
      </div>
    </>
  );
}
