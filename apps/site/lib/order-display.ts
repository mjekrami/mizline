import type { Order, OrderItem } from "@mizline/shared";

export function collectOrderInstructionNotes(order: Order): string[] {
  return order.items
    .map((item) => item.notes?.trim())
    .filter(Boolean) as string[];
}

export function getPendingOrderItems(order: Order): OrderItem[] {
  return order.items.filter((item) => !item.fulfilled);
}

export function canHandOffOrderItems(order: Order): boolean {
  return order.status === "ready" && getPendingOrderItems(order).length > 0;
}
