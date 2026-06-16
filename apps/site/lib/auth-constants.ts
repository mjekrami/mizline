export const REFRESH_COOKIE = "mizline_refresh";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";
}

export function getStaffStoreIdFromEnv(): string | undefined {
  return process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;
}

export function getDevKitchenToken(): string | undefined {
  return process.env.KITCHEN_DEV_TOKEN;
}

export function isDevFallbackEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}
