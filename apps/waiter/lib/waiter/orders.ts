import type { Order, OrderStatus } from "@mizline/shared";

const ACTIVE_STATUSES: OrderStatus[] = ["new", "preparing", "ready"];

export function getActiveKitchenOrders(orders: Order[]): Order[] {
  return orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
}
