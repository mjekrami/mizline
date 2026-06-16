import type {
  CreateOrderRequest,
  MenuCategory,
  MenuProduct,
  Order,
  Store,
  TableInfo,
} from "@mizline/shared";
import { getApiBaseUrl } from "@/lib/constants";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
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

export function getStore(storeId: string): Promise<Store> {
  return apiFetch(`/api/stores/${storeId}`);
}

export function getMenu(storeId: string): Promise<MenuCategory[]> {
  return apiFetch(`/api/stores/${storeId}/menu`);
}

export function getPopularProducts(
  storeId: string,
  limit = 8,
): Promise<MenuProduct[]> {
  return apiFetch(`/api/stores/${storeId}/menu/popular?limit=${limit}`);
}

export function getTable(storeId: string, tableId: string): Promise<TableInfo> {
  return apiFetch(`/api/stores/${storeId}/tables/${tableId}`);
}

export function createOrder(
  storeId: string,
  tableId: string,
  body: CreateOrderRequest,
): Promise<Order> {
  return apiFetch(`/api/stores/${storeId}/tables/${tableId}/orders`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getOrder(orderId: string): Promise<Order> {
  return apiFetch(`/api/orders/${orderId}`);
}

export function addItemsToOrder(
  storeId: string,
  tableId: string,
  orderId: string,
  body: import("@mizline/shared").AddOrderItemsRequest,
): Promise<Order> {
  return apiFetch(
    `/api/stores/${storeId}/tables/${tableId}/orders/${orderId}/items`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function callWaiter(
  storeId: string,
  tableId: string,
): Promise<{ ok: true }> {
  const response = await fetch(
    `/api/customer/stores/${storeId}/tables/${tableId}/call-waiter`,
    { method: "POST" },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || `Request failed (${response.status})`);
  }

  return response.json() as Promise<{ ok: true }>;
}
