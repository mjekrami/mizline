import type { KitchenMetrics, Order, OrderStatus, Store } from "@mizline/shared";
import {
  buildStaffAuthHeaders,
  getServerAccessToken,
} from "./auth-server";
import { getApiBaseUrl, getStaffStoreIdFromEnv } from "./auth-constants";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getServerAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...buildStaffAuthHeaders(accessToken),
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

export function getStoreMetrics(storeId: string): Promise<KitchenMetrics> {
  return apiFetch(`/api/stores/${storeId}/orders/metrics`);
}

export { getApiBaseUrl };

export function getConfiguredStoreId(): string | undefined {
  return getStaffStoreIdFromEnv();
}
