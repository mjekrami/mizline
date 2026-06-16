export const REFRESH_COOKIE = "mizline_refresh";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";
}

export function getStaffStoreId(): string | undefined {
  return process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;
}

export function getDevKitchenToken(): string | undefined {
  return process.env.KITCHEN_DEV_TOKEN;
}

/** Client-side dev token for Socket.IO when JWT auth is unavailable locally. */
export function getClientKitchenDevToken(): string | undefined {
  return process.env.NEXT_PUBLIC_KITCHEN_DEV_TOKEN;
}

export function hasKitchenDevToken(): boolean {
  return Boolean(process.env.KITCHEN_DEV_TOKEN);
}

export function getCustomerBaseUrl(): string {
  return process.env.NEXT_PUBLIC_CUSTOMER_URL ?? "http://localhost:3001";
}

export function hasStaffAuthConfigured(): boolean {
  return hasKitchenDevToken() || process.env.NODE_ENV === "production";
}

export function isDevFallbackEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}
