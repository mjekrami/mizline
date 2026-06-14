import type { Order, OrderStatus, Store } from "@mizline/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

function kitchenHeaders(): HeadersInit {
  const token = process.env.KITCHEN_DEV_TOKEN;
  if (!token) {
    throw new Error("KITCHEN_DEV_TOKEN is not configured");
  }

  return {
    "Content-Type": "application/json",
    "x-kitchen-dev-token": token,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...kitchenHeaders(),
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

export function listStoreOrders(storeId: string): Promise<Order[]> {
  const statuses: OrderStatus[] = ["new", "preparing", "ready", "fulfilled"];
  const query = new URLSearchParams({ status: statuses.join(",") });
  return apiFetch(`/api/stores/${storeId}/orders?${query.toString()}`);
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
