import "server-only";

import type { Order, Store } from "@mizline/shared";
import { buildStaffAuthHeaders, getServerAccessToken } from "@/lib/auth/server";
import {
  API_UNREACHABLE_MESSAGE,
  getApiBaseUrl,
  getStaffStoreId,
} from "@/lib/auth/constants";

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getServerAccessToken();

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        ...buildStaffAuthHeaders(accessToken),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(API_UNREACHABLE_MESSAGE);
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getStore(storeId: string): Promise<Store> {
  return serverFetch(`/api/stores/${storeId}`);
}

export function listWaiterOrders(storeId: string): Promise<Order[]> {
  return serverFetch(`/api/stores/${storeId}/waiter/orders`);
}

export function getConfiguredStoreId(): string | undefined {
  return getStaffStoreId();
}
