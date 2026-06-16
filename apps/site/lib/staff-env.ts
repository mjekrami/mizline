export function getStaffStoreId(): string | undefined {
  return process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;
}

export function hasKitchenDevToken(): boolean {
  return Boolean(process.env.KITCHEN_DEV_TOKEN);
}

export function getCustomerBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

export function hasStaffAuthConfigured(): boolean {
  return hasKitchenDevToken() || process.env.NODE_ENV === "production";
}
