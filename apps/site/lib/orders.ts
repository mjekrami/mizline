import type { OrderId } from "@mizline/shared";

const MAX_STORED_ORDERS = 20;

export interface StoredOrderRef {
  orderId: OrderId;
  placedAt: string;
}

interface StoredOrdersState {
  orders: StoredOrderRef[];
}

export function ordersStorageKey(storeId: string, tableId: string): string {
  return `mizline-orders:${storeId}:${tableId}`;
}

export function loadOrderRefs(
  storeId: string,
  tableId: string,
): StoredOrderRef[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(ordersStorageKey(storeId, tableId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredOrdersState;
    if (!Array.isArray(parsed.orders)) return [];

    return parsed.orders.filter(
      (ref) => typeof ref.orderId === "string" && typeof ref.placedAt === "string",
    );
  } catch {
    return [];
  }
}

function saveOrderRefs(
  storeId: string,
  tableId: string,
  orders: StoredOrderRef[],
): void {
  localStorage.setItem(
    ordersStorageKey(storeId, tableId),
    JSON.stringify({ orders }),
  );
}

export function addOrderRef(
  storeId: string,
  tableId: string,
  orderId: OrderId,
  placedAt = new Date().toISOString(),
): void {
  const existing = loadOrderRefs(storeId, tableId).filter(
    (ref) => ref.orderId !== orderId,
  );

  const next = [{ orderId, placedAt }, ...existing].slice(0, MAX_STORED_ORDERS);
  saveOrderRefs(storeId, tableId, next);
}
