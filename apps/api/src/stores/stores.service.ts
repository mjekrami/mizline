import { Injectable, NotFoundException } from "@nestjs/common";
import type { MenuCategory, Store, TableInfo } from "@mizline/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async getStore(storeId: string): Promise<Store> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    return {
      id: store.id,
      tenantId: store.tenantId,
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
          include: {
            variants: { orderBy: { name: "asc" } },
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
        },
      },
    });

    return categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        products: category.products.map((product) => ({
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
        })),
      }))
      .filter((category) => category.products.length > 0);
  }
}
