import { Injectable, NotFoundException } from "@nestjs/common";
import type { MenuCategory, MenuProduct, Store, TableInfo } from "@mizline/shared";
import { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const menuProductInclude = {
  variants: { orderBy: { name: "asc" as const } },
  modifierGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      group: {
        include: {
          options: {
            where: { available: true },
            orderBy: { sortOrder: "asc" as const },
          },
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type ProductWithMenuRelations = Prisma.ProductGetPayload<{
  include: typeof menuProductInclude;
}>;

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async getStore(storeId: string): Promise<Store> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { tenant: { select: { slug: true } } },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    return {
      id: store.id,
      tenantId: store.tenantId,
      tenantSlug: store.tenant.slug,
      name: store.name,
      address: store.address,
      timezone: store.timezone,
      delayWarningMinutes: store.delayWarningMinutes,
      delayCriticalMinutes: store.delayCriticalMinutes,
    };
  }

  async getTable(storeId: string, tableId: string): Promise<TableInfo> {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, storeId, active: true },
      select: { id: true, name: true, active: true },
    });

    if (!table) {
      throw new NotFoundException("Table not found");
    }

    return table;
  }

  async getMenu(storeId: string): Promise<MenuCategory[]> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    const categories = await this.prisma.category.findMany({
      where: { storeId },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { available: true },
          orderBy: { name: "asc" },
          include: menuProductInclude,
        },
      },
    });

    return categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        products: category.products.map((product) =>
          this.mapProductToMenuProduct(product),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }

  async getPopularProducts(
    storeId: string,
    limit = 8,
  ): Promise<MenuProduct[]> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, tenantId: true },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    const cappedLimit = Math.min(Math.max(limit, 1), 20);

    const ranked = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          tenantId: store.tenantId,
          storeId,
          status: { not: OrderStatus.cancelled },
        },
        product: {
          available: true,
          category: { storeId },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: cappedLimit,
    });

    if (ranked.length === 0) {
      return [];
    }

    const productIds = ranked.map((entry) => entry.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        available: true,
        category: { storeId },
      },
      include: menuProductInclude,
    });

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    return productIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is ProductWithMenuRelations => product != null)
      .map((product) => this.mapProductToMenuProduct(product));
  }

  private mapProductToMenuProduct(
    product: ProductWithMenuRelations,
  ): MenuProduct {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      available: product.available,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        priceModifier: variant.priceModifier,
      })),
      modifierGroups: product.modifierGroups.map((link) => ({
        id: link.group.id,
        name: link.group.name,
        minSelect: link.group.minSelect,
        maxSelect: link.group.maxSelect,
        sortOrder: link.sortOrder,
        options: link.group.options.map((option) => ({
          id: option.id,
          name: option.name,
          priceModifier: option.priceModifier,
          available: option.available,
        })),
      })),
    };
  }
}
