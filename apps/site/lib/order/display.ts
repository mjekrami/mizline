import type { Order, OrderItem } from "@mizline/shared";

export function getPendingOrderItems(order: Order): OrderItem[] {
  return order.items.filter((item) => !item.fulfilled);
}

export function canHandOffOrderItems(order: Order): boolean {
  return order.status === "ready" && getPendingOrderItems(order).length > 0;
}
