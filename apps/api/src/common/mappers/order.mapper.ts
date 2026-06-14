import type { Order, OrderItem, Prisma } from "@prisma/client";
import type { Order as SharedOrder, OrderItem as SharedOrderItem } from "@mizline/shared";
import { toSharedOrderStatus } from "../order-status";

type OrderWithRelations = Order & {
  items: (OrderItem & {
    product: { name: string };
    variant: { name: string } | null;
  })[];
  table: { name: string };
};

export function mapOrderItem(
  item: OrderWithRelations["items"][number],
): SharedOrderItem {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    productName: item.product.name,
    variantName: item.variant?.name ?? null,
    quantity: item.quantity,
    price: item.price,
    notes: item.notes,
    fulfilled: item.fulfilled,
  };
}

export function mapOrder(order: OrderWithRelations): SharedOrder {
  return {
    id: order.id,
    tenantId: order.tenantId,
    storeId: order.storeId,
    tableId: order.tableId,
    tableName: order.table.name,
    status: toSharedOrderStatus(order.status),
    subtotal: order.subtotal,
    total: order.total,
    items: order.items.map(mapOrderItem),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export const orderWithRelationsInclude = {
  items: {
    include: {
      product: { select: { name: true } },
      variant: { select: { name: true } },
    },
  },
  table: { select: { name: true } },
} satisfies Prisma.OrderInclude;
