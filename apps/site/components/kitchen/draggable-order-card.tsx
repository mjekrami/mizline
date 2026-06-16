"use client";

import type { Order } from "@mizline/shared";
import { useDrag } from "react-dnd";
import { OrderCard } from "@/components/order-card";
import {
  KITCHEN_ORDER_DND_TYPE,
  type KitchenOrderDragItem,
} from "@/lib/kitchen-dnd";
import { getNextOrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

interface DraggableOrderCardProps {
  order: Order;
  now: number;
  advancing: boolean;
  fulfillingItemId: string | null;
  onAdvance: (order: Order) => void;
  onFulfillItem: (order: Order, itemId: string) => void;
}

export function DraggableOrderCard(props: DraggableOrderCardProps) {
  const { order } = props;
  const canDrag = getNextOrderStatus(order.status) !== null;

  const [{ isDragging }, dragRef] = useDrag<
    KitchenOrderDragItem,
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: KITCHEN_ORDER_DND_TYPE,
      item: { orderId: order.id, status: order.status },
      canDrag: () => canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [order.id, order.status, canDrag],
  );

  return (
    <div
      ref={(element) => {
        if (canDrag) {
          dragRef(element);
        }
      }}
      className={cn(
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <OrderCard {...props} />
    </div>
  );
}
