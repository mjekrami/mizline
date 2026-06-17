export const APP_NAME = "Mizline";
export const APP_DEFAULT_TITLE = "Mizline";
export const APP_TITLE_TEMPLATE = "%s | Mizline";
export const APP_DESCRIPTION = "QR ordering for café guests";
export const THEME_COLOR = "#0c0c0e";
export const BACKGROUND_COLOR = "#0c0c0e";
export const DARK_THEME_COLOR = "#0c0c0e";
export const DARK_BACKGROUND_COLOR = "#0c0c0e";

export function getDemoTablePath(): string | null {
  const storeId = process.env.NEXT_PUBLIC_DEMO_STORE_ID;
  const tableId = process.env.NEXT_PUBLIC_DEMO_TABLE_ID;

  if (!storeId || !tableId) {
    return null;
  }

  return `/store/${storeId}/table/${tableId}`;
}
