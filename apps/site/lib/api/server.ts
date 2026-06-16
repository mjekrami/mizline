import type {
  AdminCatalog,
  AdminTable,
  KitchenMetrics,
  Order,
  OrderStatus,
  Store,
} from "@mizline/shared";
import { buildStaffAuthHeaders, getServerAccessToken } from "@/lib/auth/server";
import { getApiBaseUrl, getStaffStoreId } from "@/lib/auth/constants";

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
  return serverFetch(`/api/stores/${storeId}`);
}

export function listStoreOrders(storeId: string): Promise<Order[]> {
  const statuses: OrderStatus[] = ["new", "preparing", "ready", "fulfilled"];
  const query = new URLSearchParams({ status: statuses.join(",") });
  return serverFetch(`/api/stores/${storeId}/orders?${query.toString()}`);
}

export function listWaiterOrders(storeId: string): Promise<Order[]> {
  return serverFetch(`/api/stores/${storeId}/waiter/orders`);
}

export function getStoreMetrics(storeId: string): Promise<KitchenMetrics> {
  return serverFetch(`/api/stores/${storeId}/orders/metrics`);
}

export function getAdminCatalog(storeId: string): Promise<AdminCatalog> {
  return serverFetch(`/api/stores/${storeId}/admin/catalog`);
}

export function getAdminTables(storeId: string): Promise<AdminTable[]> {
  return serverFetch(`/api/stores/${storeId}/admin/tables`);
}

export { getApiBaseUrl };

export function getConfiguredStoreId(): string | undefined {
  return getStaffStoreId();
}
