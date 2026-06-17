import type { OrderStatus } from "@mizline/shared";

export const orderStatusBarColors: Record<OrderStatus, string> = {
  new: "bg-order-new",
  preparing: "bg-order-preparing",
  ready: "bg-order-ready",
  fulfilled: "bg-order-fulfilled",
  cancelled: "bg-order-cancelled",
};
