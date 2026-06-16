import type { Order, OrderItem, OrderStatus } from "@mizline/shared";

export type KitchenItemTab = "called" | "pending" | "delivered";

export type KitchenViewMode = "grid" | "list";

export interface KitchenBoardStats {
  totalItems: number;
  called: number;
  pending: number;
  delivered: number;
}

const ACTIVE_STATUSES: OrderStatus[] = ["new", "preparing", "ready"];

export function getActiveKitchenOrders(orders: Order[]): Order[] {
  return orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
}

export function getDefaultItemTab(status: OrderStatus): KitchenItemTab {
  if (status === "ready") return "called";
  if (status === "fulfilled") return "delivered";
  return "pending";
}

export function filterItemsByTab(
  items: OrderItem[],
  tab: KitchenItemTab,
  orderStatus: OrderStatus,
): OrderItem[] {
  switch (tab) {
    case "pending":
      if (orderStatus === "new" || orderStatus === "preparing") {
        return items.filter((item) => !item.fulfilled);
      }
      return [];
    case "called":
      if (orderStatus === "ready") {
        return items.filter((item) => !item.fulfilled);
      }
      return [];
    case "delivered":
      return items.filter((item) => item.fulfilled);
  }
}

export function buildKitchenBoardStats(orders: Order[]): KitchenBoardStats {
  let totalItems = 0;
  let called = 0;
  let pending = 0;
  let delivered = 0;

  for (const order of getActiveKitchenOrders(orders)) {
    for (const item of order.items) {
      const qty = item.quantity;
      totalItems += qty;

      if (item.fulfilled) {
        delivered += qty;
        continue;
      }

      if (order.status === "ready") {
        called += qty;
      } else {
        pending += qty;
      }
    }
  }

  return { totalItems, called, pending, delivered };
}

export function formatKitchenTableLabel(tableName: string): string {
  return tableName.trim().toUpperCase();
}

export function getReadyAllLabel(status: OrderStatus): string | null {
  switch (status) {
    case "new":
      return "Start all";
    case "preparing":
      return "Ready all";
    case "ready":
      return "Deliver all";
    default:
      return null;
  }
}

export function splitItemModifiers(item: OrderItem) {
  const extras = item.modifiers.filter((mod) => mod.priceModifier > 0);
  const base = item.modifiers.filter((mod) => mod.priceModifier <= 0);
  return { base, extras };
}
