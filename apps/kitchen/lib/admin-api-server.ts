import type { AdminCatalog, AdminTable } from "@mizline/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

function adminHeaders(): HeadersInit {
  const token = process.env.KITCHEN_DEV_TOKEN;
  if (!token) {
    throw new Error("KITCHEN_DEV_TOKEN is not configured");
  }

  return {
    "Content-Type": "application/json",
    "x-kitchen-dev-token": token,
  };
}

async function adminFetch<T>(storeId: string, path: string): Promise<T> {
  const response = await fetch(
    `${API_BASE}/api/stores/${storeId}/admin${path}`,
    {
      headers: adminHeaders(),
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
