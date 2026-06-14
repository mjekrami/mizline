import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { OrderStatus } from "@mizline/shared";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import {
  isValidOrderStatusTransition,
  toSharedOrderStatus,
} from "../common/order-status";
import {
  mapOrder,
  orderWithRelationsInclude,
} from "../common/mappers/order.mapper";
import { PrismaService } from "../prisma/prisma.service";
import { RealtimeService } from "../realtime/realtime.service";
import { CreateOrderDto } from "./dto/create-order.dto";

const DEFAULT_KDS_STATUSES: OrderStatus[] = ["new", "preparing", "ready"];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
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

    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        available: true,
        category: { storeId },
      },
      include: { variants: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("One or more products are invalid or unavailable");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    let subtotal = 0;

    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      let unitPrice = product.price;
      let variantId: string | undefined;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new BadRequestException(
            `Variant ${item.variantId} is invalid for product ${item.productId}`,
          );
        }
        unitPrice += variant.priceModifier;
        variantId = variant.id;
      }

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        productId: item.productId,
        variantId,
        quantity: item.quantity,
        price: unitPrice,
        notes: item.notes,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        tenantId: store.tenantId,
        storeId,
        tableId,
        status: PrismaOrderStatus.new,
        subtotal,
        total: subtotal,
        items: { create: orderItems },
      },
      include: orderWithRelationsInclude,
    });

    this.realtime.emitOrderCreated(storeId, { orderId: order.id });

    return mapOrder(order);
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

  async updateStatus(orderId: string, nextStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
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

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus as PrismaOrderStatus },
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
