import type { OrderStatus } from "@mizline/shared";

export const KITCHEN_ORDER_DND_TYPE = "KITCHEN_ORDER";

export interface KitchenOrderDragItem {
  orderId: string;
  status: OrderStatus;
}
