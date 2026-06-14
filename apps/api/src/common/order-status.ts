import type { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import type { OrderStatus } from "@mizline/shared";

export function toSharedOrderStatus(status: PrismaOrderStatus): OrderStatus {
  return status as OrderStatus;
}

export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus | null
> = {
  new: "preparing",
  preparing: "ready",
  ready: "fulfilled",
  fulfilled: null,
  cancelled: null,
};

export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  return ORDER_STATUS_TRANSITIONS[current];
}

export function isValidOrderStatusTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return getNextOrderStatus(from) === to;
}
