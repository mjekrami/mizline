export type BottomTab = "home" | "favorites" | "profile";

export function getCustomerTabHref(
  storeId: string,
  tableId: string,
  tab: BottomTab,
): string {
  const base = `/store/${storeId}/table/${tableId}`;

  switch (tab) {
    case "favorites":
      return `${base}?tab=favorites`;
    case "profile":
      return `${base}/orders`;
    default:
      return base;
  }
}

export function parseCustomerTab(tab: string | undefined): BottomTab {
  return tab === "favorites" ? "favorites" : "home";
}

export function resolveCustomerTabFromPath(
  pathname: string,
  tabParam: string | undefined,
): BottomTab {
  if (pathname.endsWith("/orders") || /\/order\/[^/]+$/.test(pathname)) {
    return "profile";
  }

  return parseCustomerTab(tabParam);
}
