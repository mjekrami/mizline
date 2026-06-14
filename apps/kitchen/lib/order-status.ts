import type { OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "fulfilled",
  fulfilled: null,
  cancelled: null,
};

export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[current];
}

export function getAdvanceActionLabel(current: OrderStatus): string | null {
  const next = getNextOrderStatus(current);
  if (!next) return null;
  return `Mark ${orderStatusLabels[next]}`;
}
