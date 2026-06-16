import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { KitchenMetrics, OrderStatus } from "@mizline/shared";
import { isOrderModifiable, canCustomerAddItems } from "@mizline/shared";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import {
  isValidOrderStatusTransition,
  toSharedOrderStatus,
} from "../common/order-status";
import {
  mapOrder,
  orderWithRelationsInclude,
} from "../common/mappers/order.mapper";
import { getStoreDayBounds } from "../common/timezone";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeService } from "../realtime/realtime.service";
import { CreateOrderDto, CreateOrderItemDto } from "./dto/create-order.dto";
import { AddOrderItemsDto } from "./dto/add-order-items.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { AssignmentService } from "./assignment.service";

const DEFAULT_KDS_STATUSES: OrderStatus[] = ["new", "preparing", "ready"];

type ProductForOrder = {
  id: string;
  name: string;
  price: number;
  variants: Array<{ id: string; name: string; priceModifier: number }>;
  modifierGroups: Array<{
    group: {
      id: string;
      name: string;
      minSelect: number;
      maxSelect: number;
      options: Array<{
        id: string;
        name: string;
        priceModifier: number;
      }>;
    };
  }>;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly assignment: AssignmentService,
  ) {}

  async createOrder(
    storeId: string,
    tableId: string,
    dto: CreateOrderDto,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, tenantId: true },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    const table = await this.prisma.table.findFirst({
      where: { id: tableId, storeId, active: true },
    });

    if (!table) {
      throw new NotFoundException("Table not found");
    }

    const products = await this.loadValidatedProductsForOrder(
      storeId,
      dto.items.map((item) => item.productId),
    );
    const productMap = new Map(products.map((product) => [product.id, product]));
    const { orderItems, subtotal } = this.buildOrderItemsFromDto(
      productMap,
      dto.items,
    );

    const order = await this.prisma.order.create({
      data: {
        tenantId: store.tenantId,
        storeId,
        tableId,
        tableName: table.name,
        status: PrismaOrderStatus.new,
        subtotal,
        total: subtotal,
        items: { create: orderItems },
      },
      include: orderWithRelationsInclude,
    });

    this.realtime.emitOrderCreated(storeId, { orderId: order.id });
    await this.assignment.assignNextWaiter(storeId, order.id);

    const assigned = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: orderWithRelationsInclude,
    });

    return mapOrder(assigned ?? order);
  }

  async addOrderItems(
    orderId: string,
    dto: AddOrderItemsDto,
    options?: { tableId?: string; storeId?: string; customerRequest?: boolean },
  ) {
    const order = await this.getModifiableOrder(
      orderId,
      options?.tableId,
      options?.storeId,
      options?.customerRequest,
    );
    const { orderItems, subtotal: addedSubtotal } =
      await this.prepareOrderItemsForStore(order.storeId, dto.items);

    await this.prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.orderItem.create({
          data: {
            orderId,
            ...item,
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: this.buildContentChangeUpdate(order, addedSubtotal),
      });
    });

    return this.publishOrderChange(orderId, order.storeId, order.status);
  }

  async updateOrderItem(
    orderId: string,
    itemId: string,
    dto: UpdateOrderItemDto,
  ) {
    if (dto.quantity === undefined && dto.notes === undefined) {
      throw new BadRequestException("No changes provided");
    }

    const order = await this.getModifiableOrder(orderId);
    const item = order.items.find((entry) => entry.id === itemId);

    if (!item) {
      throw new NotFoundException("Order item not found");
    }

    if (item.fulfilled) {
      throw new BadRequestException("Fulfilled items cannot be modified");
    }

    const previousLineTotal = item.price * item.quantity;
    const nextQuantity = dto.quantity ?? item.quantity;
    const nextLineTotal = item.price * nextQuantity;
    const subtotalDelta = nextLineTotal - previousLineTotal;

    await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.update({
        where: { id: itemId },
        data: {
          quantity: dto.quantity,
          notes: dto.notes === undefined ? undefined : dto.notes,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: this.buildContentChangeUpdate(order, subtotalDelta),
      });
    });

    return this.publishOrderChange(orderId, order.storeId, order.status);
  }

  async removeOrderItem(orderId: string, itemId: string) {
    const order = await this.getModifiableOrder(orderId);
    const item = order.items.find((entry) => entry.id === itemId);

    if (!item) {
      throw new NotFoundException("Order item not found");
    }

    if (item.fulfilled) {
      throw new BadRequestException("Fulfilled items cannot be removed");
    }

    if (order.items.length <= 1) {
      throw new BadRequestException("An order must contain at least one item");
    }

    const removedSubtotal = item.price * item.quantity;

    await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { id: itemId } });

      await tx.order.update({
        where: { id: orderId },
        data: this.buildContentChangeUpdate(order, -removedSubtotal),
      });
    });

    return this.publishOrderChange(orderId, order.storeId, order.status);
  }

  private async getReadyOrder(orderId: string, notReadyMessage: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.status !== PrismaOrderStatus.ready) {
      throw new BadRequestException(notReadyMessage);
    }

    return order;
  }

  private async getModifiableOrder(
    orderId: string,
    tableId?: string,
    storeId?: string,
    customerRequest?: boolean,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (tableId && order.tableId !== tableId) {
      throw new ForbiddenException("Order does not belong to this table");
    }

    if (storeId && order.storeId !== storeId) {
      throw new ForbiddenException("Order does not belong to this store");
    }

    const status = toSharedOrderStatus(order.status);
    if (!isOrderModifiable(status)) {
      throw new BadRequestException("This order can no longer be modified");
    }

    if (customerRequest && !canCustomerAddItems(status)) {
      throw new BadRequestException(
        "Items can only be added while the order is being prepared",
      );
    }

    return order;
  }

  private buildContentChangeUpdate(
    order: { subtotal: number; total: number; status: PrismaOrderStatus },
    subtotalDelta: number,
  ) {
    const nextSubtotal = order.subtotal + subtotalDelta;
    const data: {
      subtotal: number;
      total: number;
      status?: PrismaOrderStatus;
      readyAt?: null;
    } = {
      subtotal: nextSubtotal,
      total: nextSubtotal,
    };

    if (order.status === PrismaOrderStatus.ready && subtotalDelta !== 0) {
      data.status = PrismaOrderStatus.preparing;
      data.readyAt = null;
    }

    return data;
  }

  private async publishOrderChange(
    orderId: string,
    storeId: string,
    previousStatus: PrismaOrderStatus,
  ) {
    const refreshed = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithRelationsInclude,
    });

    if (!refreshed) {
      throw new NotFoundException("Order not found");
    }

    const payload = { orderId: refreshed.id };
    this.realtime.emitOrderUpdated(storeId, refreshed.id, payload);

    if (
      previousStatus === PrismaOrderStatus.ready &&
      refreshed.status === PrismaOrderStatus.preparing
    ) {
      this.realtime.emitOrderPreparing(storeId, refreshed.id, payload);
    }

    return mapOrder(refreshed);
  }

  private async prepareOrderItemsForStore(
    storeId: string,
    items: CreateOrderItemDto[],
  ) {
    const products = await this.loadValidatedProductsForOrder(
      storeId,
      items.map((item) => item.productId),
    );
    const productMap = new Map(products.map((product) => [product.id, product]));
    return this.buildOrderItemsFromDto(productMap, items);
  }

  private async loadValidatedProductsForOrder(
    storeId: string,
    productIds: string[],
  ): Promise<ProductForOrder[]> {
    const uniqueIds = [...new Set(productIds)];
    const products = await this.loadProductsForOrder(storeId, uniqueIds);

    if (products.length !== uniqueIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const unavailableIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `One or more products are invalid or unavailable:unavailable:${unavailableIds.join(",")}`,
      );
    }

    return products;
  }

  private buildOrderItemsFromDto(
    productMap: Map<string, ProductForOrder>,
    items: CreateOrderItemDto[],
  ) {
    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      if (product.variants.length > 0 && !item.variantId) {
        throw new BadRequestException(
          `Product ${product.name} requires a size selection`,
        );
      }

      let unitPrice = product.price;
      let variantId: string | undefined;
      let variantName: string | null = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new BadRequestException(
            `Variant ${item.variantId} is invalid for product ${item.productId}`,
          );
        }
        unitPrice += variant.priceModifier;
        variantId = variant.id;
        variantName = variant.name;
      }

      const selectedOptionIds = item.modifierOptionIds ?? [];
      const modifierSnapshots = this.validateAndSnapshotModifiers(
        product,
        selectedOptionIds,
      );

      for (const modifier of modifierSnapshots) {
        unitPrice += modifier.priceModifier;
      }

      subtotal += unitPrice * item.quantity;

      return {
        productId: item.productId,
        productName: product.name,
        variantId,
        variantName,
        quantity: item.quantity,
        price: unitPrice,
        notes: item.notes,
        modifiers: {
          create: modifierSnapshots.map((modifier) => ({
            optionId: modifier.optionId,
            optionName: modifier.optionName,
            priceModifier: modifier.priceModifier,
          })),
        },
      };
    });

    return { orderItems, subtotal };
  }

  private async loadProductsForOrder(storeId: string, productIds: string[]) {
    return this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        available: true,
        category: { storeId },
      },
      include: {
        variants: true,
        modifierGroups: {
          orderBy: { sortOrder: "asc" },
          include: {
            group: {
              include: {
                options: {
                  where: { available: true },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });
  }

  private validateAndSnapshotModifiers(
    product: ProductForOrder,
    selectedOptionIds: string[],
  ) {
    const modifierGroups = product.modifierGroups.map((link) => link.group);
    const selectedSet = new Set(selectedOptionIds);
    const snapshots: Array<{
      optionId: string;
      optionName: string;
      priceModifier: number;
    }> = [];

    for (const group of modifierGroups) {
      const groupOptionIds = new Set(group.options.map((option) => option.id));
      const selectedInGroup = selectedOptionIds.filter((id) =>
        groupOptionIds.has(id),
      );

      if (selectedInGroup.length < group.minSelect) {
        throw new BadRequestException(
          `Select at least ${group.minSelect} option(s) for ${group.name}`,
        );
      }

      if (group.maxSelect > 0 && selectedInGroup.length > group.maxSelect) {
        throw new BadRequestException(
          `Select at most ${group.maxSelect} option(s) for ${group.name}`,
        );
      }
    }

    for (const optionId of selectedOptionIds) {
      let matched = false;

      for (const group of modifierGroups) {
        const option = group.options.find((entry) => entry.id === optionId);
        if (option) {
          matched = true;
          snapshots.push({
            optionId: option.id,
            optionName: option.name,
            priceModifier: option.priceModifier,
          });
          break;
        }
      }

      if (!matched) {
        throw new BadRequestException(`Modifier option ${optionId} is invalid`);
      }
    }

    if (selectedSet.size !== selectedOptionIds.length) {
      throw new BadRequestException("Duplicate modifier selections are not allowed");
    }

    return snapshots;
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithRelationsInclude,
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return mapOrder(order);
  }

  async listStoreOrders(storeId: string, statusFilter?: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, tenantId: true },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    const statuses = this.parseStatusFilter(statusFilter);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId: store.tenantId,
        storeId,
        status: { in: statuses.map((s) => s as PrismaOrderStatus) },
      },
      orderBy: { createdAt: "asc" },
      include: orderWithRelationsInclude,
    });

    return orders.map(mapOrder);
  }

  async getStoreMetrics(storeId: string): Promise<KitchenMetrics> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, tenantId: true, timezone: true },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    const { start, end } = getStoreDayBounds(store.timezone);

    const [ordersWaiting, ordersCompletedToday, prepSamples] = await Promise.all([
      this.prisma.order.count({
        where: {
          tenantId: store.tenantId,
          storeId,
          status: PrismaOrderStatus.new,
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId: store.tenantId,
          storeId,
          status: PrismaOrderStatus.fulfilled,
          fulfilledAt: { gte: start, lte: end },
        },
      }),
      this.prisma.order.findMany({
        where: {
          tenantId: store.tenantId,
          storeId,
          status: PrismaOrderStatus.fulfilled,
          fulfilledAt: { gte: start, lte: end },
          preparingAt: { not: null },
          readyAt: { not: null },
        },
        select: { preparingAt: true, readyAt: true },
      }),
    ]);

    let averagePrepTimeSeconds: number | null = null;

    if (prepSamples.length > 0) {
      const totalSeconds = prepSamples.reduce((sum, order) => {
        const durationMs =
          order.readyAt!.getTime() - order.preparingAt!.getTime();
        return sum + Math.max(0, durationMs / 1000);
      }, 0);

      averagePrepTimeSeconds = Math.round(totalSeconds / prepSamples.length);
    }

    return {
      ordersWaiting,
      averagePrepTimeSeconds,
      ordersCompletedToday,
    };
  }

  async updateStatus(
    orderId: string,
    nextStatus: OrderStatus,
    actingUserId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const currentStatus = toSharedOrderStatus(order.status);

    if (!isValidOrderStatusTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${nextStatus}`,
      );
    }

    if (
      nextStatus === "fulfilled" &&
      !order.items.every((item) => item.fulfilled)
    ) {
      throw new BadRequestException(
        "All items must be handed off before completing the order",
      );
    }

    const now = new Date();
    const timestampUpdates: {
      preparingAt?: Date;
      readyAt?: Date;
      fulfilledAt?: Date;
    } = {};

    if (nextStatus === "preparing") {
      timestampUpdates.preparingAt = now;
      if (!order.assignedToId && actingUserId && actingUserId !== "dev-user") {
        await this.assignment.claimOrderForUser(orderId, actingUserId);
      }
    } else if (nextStatus === "ready") {
      timestampUpdates.readyAt = now;
      if (!order.preparingAt) {
        timestampUpdates.preparingAt = now;
      }
    } else if (nextStatus === "fulfilled") {
      timestampUpdates.fulfilledAt = now;
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus as PrismaOrderStatus,
        ...timestampUpdates,
      },
      include: orderWithRelationsInclude,
    });

    const payload = { orderId: updated.id };

    switch (nextStatus) {
      case "preparing":
        this.realtime.emitOrderPreparing(
          updated.storeId,
          updated.id,
          payload,
        );
        break;
      case "ready":
        this.realtime.emitOrderReady(updated.storeId, updated.id, payload);
        break;
      case "fulfilled":
        this.realtime.emitOrderFulfilled(
          updated.storeId,
          updated.id,
          payload,
        );
        break;
    }

    return mapOrder(updated);
  }

  async fulfillOrderItem(orderId: string, itemId: string) {
    const order = await this.getReadyOrder(
      orderId,
      "Items can only be handed off when the order is ready",
    );

    const item = order.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new NotFoundException("Order item not found");
    }

    if (item.fulfilled) {
      throw new BadRequestException("Item is already handed off");
    }

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { fulfilled: true },
    });

    const refreshed = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithRelationsInclude,
    });

    if (!refreshed) {
      throw new NotFoundException("Order not found");
    }

    const allFulfilled = refreshed.items.every((entry) => entry.fulfilled);

    if (allFulfilled) {
      const completed = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: PrismaOrderStatus.fulfilled,
          fulfilledAt: new Date(),
        },
        include: orderWithRelationsInclude,
      });

      this.realtime.emitOrderFulfilled(
        completed.storeId,
        completed.id,
        { orderId: completed.id },
      );

      return mapOrder(completed);
    }

    this.realtime.emitOrderReady(refreshed.storeId, refreshed.id, {
      orderId: refreshed.id,
    });

    return mapOrder(refreshed);
  }

  async fulfillOrder(orderId: string) {
    await this.getReadyOrder(
      orderId,
      "Order can only be delivered when it is ready",
    );

    const now = new Date();

    const completed = await this.prisma.$transaction(async (tx) => {
      await tx.orderItem.updateMany({
        where: { orderId, fulfilled: false },
        data: { fulfilled: true },
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: PrismaOrderStatus.fulfilled,
          fulfilledAt: now,
        },
        include: orderWithRelationsInclude,
      });
    });

    this.realtime.emitOrderFulfilled(completed.storeId, completed.id, {
      orderId: completed.id,
    });

    return mapOrder(completed);
  }

  private parseStatusFilter(statusFilter?: string): OrderStatus[] {
    if (!statusFilter) {
      return DEFAULT_KDS_STATUSES;
    }

    const allowed: OrderStatus[] = [
      "new",
      "preparing",
      "ready",
      "fulfilled",
      "cancelled",
    ];
    const parsed = statusFilter
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean) as OrderStatus[];

    const invalid = parsed.filter((status) => !allowed.includes(status));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid status filter: ${invalid.join(", ")}`);
    }

    return parsed.length > 0 ? parsed : DEFAULT_KDS_STATUSES;
  }
}
