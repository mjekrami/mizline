import { Injectable, NotFoundException } from "@nestjs/common";
import type { MenuCategory, Store } from "@mizline/shared";
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
    };
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
          },
        },
      },
    });

    return categories.map((category) => ({
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
      })),
    }));
  }
}
