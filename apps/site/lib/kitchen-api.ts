import type { KitchenMetrics, Order, OrderStatus } from "@mizline/shared";

async function kitchenFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function listStoreOrders(): Promise<Order[]> {
  return kitchenFetch("/api/kitchen/orders");
}

export function getKitchenOrder(orderId: string): Promise<Order> {
  return kitchenFetch(`/api/kitchen/orders/${orderId}`);
}

export function getKitchenMetrics(): Promise<KitchenMetrics> {
  return kitchenFetch("/api/kitchen/metrics");
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return kitchenFetch(`/api/kitchen/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function fulfillOrderItem(
  orderId: string,
  itemId: string,
): Promise<Order> {
  return kitchenFetch(`/api/kitchen/orders/${orderId}/items/${itemId}/fulfill`, {
    method: "PATCH",
  });
}
