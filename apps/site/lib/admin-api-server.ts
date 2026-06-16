import type { AdminCatalog, AdminTable } from "@mizline/shared";
import {
  buildStaffAuthHeaders,
  getServerAccessToken,
} from "./auth-server";
import { getApiBaseUrl } from "./auth-constants";

async function adminFetch<T>(storeId: string, path: string): Promise<T> {
  const accessToken = await getServerAccessToken();
  const response = await fetch(
    `${getApiBaseUrl()}/api/stores/${storeId}/admin${path}`,
    {
      headers: buildStaffAuthHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getAdminCatalog(storeId: string): Promise<AdminCatalog> {
  return adminFetch(storeId, "/catalog");
}

export function getAdminTables(storeId: string): Promise<AdminTable[]> {
  return adminFetch(storeId, "/tables");
}
