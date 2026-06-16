"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { useDrop } from "react-dnd";
import { DraggableOrderCard } from "@/components/kitchen/draggable-order-card";
import {
  KITCHEN_ORDER_DND_TYPE,
  type KitchenOrderDragItem,
} from "@/lib/kitchen-dnd";
import { canAdvanceOrderTo } from "@/lib/order-status";
import { VirtualList } from "@/components/ui/virtual-list";
import { cn } from "@/lib/utils";

interface KitchenStatusColumnProps {
  status: OrderStatus;
  accentClassName: string;
  orders: Order[];
  now: number;
  advancingId: string | null;
  fulfillingItemId: string | null;
  onAdvance: (order: Order) => void;
  onAdvanceToStatus: (orderId: string, status: OrderStatus) => void;
  onFulfillItem: (order: Order, itemId: string) => void;
}

export function KitchenStatusColumn({
  status,
  accentClassName,
  orders,
  now,
  advancingId,
  fulfillingItemId,
  onAdvance,
  onAdvanceToStatus,
  onFulfillItem,
}: KitchenStatusColumnProps) {
  const [{ isOver, canDrop }, dropRef] = useDrop<
    KitchenOrderDragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: KITCHEN_ORDER_DND_TYPE,
      canDrop: (item) => canAdvanceOrderTo(item.status, status),
      drop: (item) => {
        onAdvanceToStatus(item.orderId, status);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [status, onAdvanceToStatus],
  );

  const showDropHint = isOver && canDrop;

  return (
    <section
      ref={(element) => {
        dropRef(element);
      }}
      className={cn(
        "flex min-h-[24rem] flex-col gap-3 rounded-lg border border-t-4 bg-card/80 p-3 transition-colors md:h-full md:min-h-0",
        accentClassName,
        showDropHint && "ring-2 ring-accent ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          {orderStatusLabels[status]}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {orders.length}
        </span>
      </div>

      <VirtualList
        items={orders}
        estimateSize={180}
        gap={12}
        className="min-h-0 flex-1 pr-1 md:overflow-y-auto"
        getItemKey={(order) => order.id}
        empty={
          <p className="px-1 text-sm text-muted-foreground">No orders</p>
        }
        renderItem={(order) => (
          <DraggableOrderCard
            order={order}
            now={now}
            advancing={advancingId === order.id}
            fulfillingItemId={fulfillingItemId}
            onAdvance={onAdvance}
            onFulfillItem={onFulfillItem}
          />
        )}
      />
    </section>
  );
}
