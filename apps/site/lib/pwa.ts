export const APP_NAME = "Mizline";
export const APP_DEFAULT_TITLE = "Mizline";
export const APP_TITLE_TEMPLATE = "%s | Mizline";
export const APP_DESCRIPTION = "QR ordering for café guests";
export const THEME_COLOR = "#1A1210";
export const BACKGROUND_COLOR = "#DDD4C8";
export const DARK_THEME_COLOR = "#080605";
export const DARK_BACKGROUND_COLOR = "#080605";

export function getDemoTablePath(): string | null {
  const storeId = process.env.NEXT_PUBLIC_DEMO_STORE_ID;
  const tableId = process.env.NEXT_PUBLIC_DEMO_TABLE_ID;

  if (!storeId || !tableId) {
    return null;
  }

  return `/store/${storeId}/table/${tableId}`;
}
