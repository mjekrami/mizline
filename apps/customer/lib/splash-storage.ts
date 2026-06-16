const SPLASH_KEY_PREFIX = "mizline-splash-seen";

function splashStorageKey(storeId: string, tableId: string): string {
  return `${SPLASH_KEY_PREFIX}:${storeId}:${tableId}`;
}

export function hasSeenSplash(storeId: string, tableId: string): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(splashStorageKey(storeId, tableId)) === "1";
}

export function markSplashSeen(storeId: string, tableId: string): void {
  sessionStorage.setItem(splashStorageKey(storeId, tableId), "1");
}
