import type { OrderStatus } from "./colors";

export const MODIFIABLE_ORDER_STATUSES: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
];

export const CUSTOMER_ADD_ITEMS_STATUSES: OrderStatus[] = ["new", "preparing"];

export function isOrderModifiable(status: OrderStatus): boolean {
  return MODIFIABLE_ORDER_STATUSES.includes(status);
}

export function canCustomerAddItems(status: OrderStatus): boolean {
  return CUSTOMER_ADD_ITEMS_STATUSES.includes(status);
}
