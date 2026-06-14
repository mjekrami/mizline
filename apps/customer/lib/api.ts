import type {
  CreateOrderRequest,
  MenuCategory,
  Order,
  Store,
} from "@mizline/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
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

export function getApiBaseUrl(): string {
  return API_BASE;
}
