import type {
  AddOrderItemsRequest,
  KitchenMetrics,
  Order,
  OrderStatus,
  UpdateOrderItemRequest,
} from "@mizline/shared";
import { clientApiFetch } from "./fetch";

export function listStoreOrders(): Promise<Order[]> {
  return clientApiFetch("/api/kitchen/orders");
}

export function getKitchenOrder(orderId: string): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}`);
}

export function getKitchenMetrics(): Promise<KitchenMetrics> {
  return clientApiFetch("/api/kitchen/metrics");
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function fulfillOrderItem(
  orderId: string,
  itemId: string,
): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}/items/${itemId}/fulfill`, {
    method: "PATCH",
  });
}

export function fulfillOrder(orderId: string): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}/fulfill`, {
    method: "PATCH",
  });
}

export function addOrderItems(
  orderId: string,
  body: AddOrderItemsRequest,
): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateOrderItem(
  orderId: string,
  itemId: string,
  body: UpdateOrderItemRequest,
): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function removeOrderItem(orderId: string, itemId: string): Promise<Order> {
  return clientApiFetch(`/api/kitchen/orders/${orderId}/items/${itemId}`, {
    method: "DELETE",
  });
}
