import type { Order } from "@mizline/shared";
import { clientApiFetch } from "@/lib/api/fetch";

export function listWaiterOrders(): Promise<Order[]> {
  return clientApiFetch("/api/waiter/orders");
}

export function getWaiterOrder(orderId: string): Promise<Order> {
  return clientApiFetch(`/api/waiter/orders/${orderId}`);
}
