import type { Order, OrderItem, Prisma } from "@prisma/client";
import type { Order as SharedOrder, OrderItem as SharedOrderItem } from "@mizline/shared";
import { toSharedOrderStatus } from "../order-status";

type OrderWithRelations = Order & {
  items: (OrderItem & {
    modifiers: {
      id: string;
      optionId: string | null;
      optionName: string;
      priceModifier: number;
    }[];
  })[];
  assignedTo?: { id: string; name: string } | null;
};

function mapOrderItem(
  item: OrderWithRelations["items"][number],
): SharedOrderItem {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.variantName,
    quantity: item.quantity,
    price: item.price,
    notes: item.notes,
    modifiers: item.modifiers.map((modifier) => ({
      id: modifier.id,
      optionId: modifier.optionId,
      optionName: modifier.optionName,
      priceModifier: modifier.priceModifier,
    })),
    fulfilled: item.fulfilled,
  };
}

export function mapOrder(order: OrderWithRelations): SharedOrder {
  return {
    id: order.id,
    tenantId: order.tenantId,
    storeId: order.storeId,
    tableId: order.tableId,
    tableName: order.tableName,
    status: toSharedOrderStatus(order.status),
    subtotal: order.subtotal,
    total: order.total,
    items: order.items.map(mapOrderItem),
    assignedTo: order.assignedTo
      ? { id: order.assignedTo.id, name: order.assignedTo.name }
      : null,
    assignedAt: order.assignedAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export const orderWithRelationsInclude = {
  items: {
    include: {
      modifiers: true,
    },
  },
  assignedTo: { select: { id: true, name: true } },
} satisfies Prisma.OrderInclude;
