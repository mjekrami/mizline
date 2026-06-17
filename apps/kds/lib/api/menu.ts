import type { MenuCategory } from "@mizline/shared";
import { getApiBaseUrl } from "@/lib/auth/constants";

export async function getMenu(storeId: string): Promise<MenuCategory[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/stores/${storeId}/menu`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<MenuCategory[]>;
}
