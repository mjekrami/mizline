import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AdminCatalog,
  AdminProduct,
  AdminTable,
} from "@mizline/shared";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCategoryDto,
  CreateProductDto,
  CreateTableDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateTableDto,
} from "./dto/admin.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalog(storeId: string): Promise<AdminCatalog> {
    await this.assertStore(storeId);

    const categories = await this.prisma.category.findMany({
      where: { storeId },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    const products = await this.prisma.product.findMany({
      where: { category: { storeId } },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        productCount: category._count.products,
      })),
      products: products.map((product) => this.toAdminProduct(product)),
    };
  }

  async listTables(storeId: string): Promise<AdminTable[]> {
    await this.assertStore(storeId);

    const tables = await this.prisma.table.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
    });

    return tables.map((table) => ({
      id: table.id,
      name: table.name,
      qrCode: table.qrCode,
      active: table.active,
    }));
  }

  async createCategory(storeId: string, dto: CreateCategoryDto) {
    await this.assertStore(storeId);

    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.category.count({ where: { storeId } }));

    const category = await this.prisma.category.create({
      data: {
        storeId,
        name: dto.name.trim(),
        sortOrder,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return {
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    };
  }

  async updateCategory(
    storeId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    await this.assertCategoryInStore(storeId, categoryId);

    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return {
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    };
  }

  async deleteCategory(storeId: string, categoryId: string) {
    const category = await this.assertCategoryInStore(storeId, categoryId);

    if (category._count.products > 0) {
      throw new ConflictException(
        "Remove or reassign products before deleting this category",
      );
    }

    await this.prisma.category.delete({ where: { id: categoryId } });
  }

  async createProduct(
    storeId: string,
    dto: CreateProductDto,
  ): Promise<AdminProduct> {
    await this.assertCategoryInStore(storeId, dto.categoryId);

    const product = await this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        price: dto.price,
        image: dto.image?.trim() || null,
        available: dto.available ?? true,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return this.toAdminProduct(product);
  }

  async updateProduct(
    storeId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<AdminProduct> {
    await this.assertProductInStore(storeId, productId);

    if (dto.categoryId) {
      await this.assertCategoryInStore(storeId, dto.categoryId);
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description?.trim() || null }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.image !== undefined
          ? { image: dto.image?.trim() || null }
          : {}),
        ...(dto.available !== undefined ? { available: dto.available } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return this.toAdminProduct(product);
  }

  async deleteProduct(storeId: string, productId: string) {
    await this.assertProductInStore(storeId, productId);

    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId },
    });

    if (orderItemCount > 0) {
      throw new ConflictException(
        "Cannot delete a product that appears on past orders",
      );
    }

    await this.prisma.product.delete({ where: { id: productId } });
  }

  async createTable(storeId: string, dto: CreateTableDto): Promise<AdminTable> {
    await this.assertStore(storeId);

    const qrCode = dto.qrCode.trim();
    const existing = await this.prisma.table.findUnique({
      where: { qrCode },
    });

    if (existing) {
      throw new ConflictException("A table with this QR code already exists");
    }

    const table = await this.prisma.table.create({
      data: {
        storeId,
        name: dto.name.trim(),
        qrCode,
        active: true,
      },
    });

    return {
      id: table.id,
      name: table.name,
      qrCode: table.qrCode,
      active: table.active,
    };
  }

  async updateTable(
    storeId: string,
    tableId: string,
    dto: UpdateTableDto,
  ): Promise<AdminTable> {
    await this.assertTableInStore(storeId, tableId);

    const table = await this.prisma.table.update({
      where: { id: tableId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });

    return {
      id: table.id,
      name: table.name,
      qrCode: table.qrCode,
      active: table.active,
    };
  }

  private async assertStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException("Store not found");
    }

    return store;
  }

  private async assertCategoryInStore(storeId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, storeId },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  private async assertProductInStore(storeId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, category: { storeId } },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  private async assertTableInStore(storeId: string, tableId: string) {
    const table = await this.prisma.table.findFirst({
      where: { id: tableId, storeId },
    });

    if (!table) {
      throw new NotFoundException("Table not found");
    }

    return table;
  }

  private toAdminProduct(product: {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    available: boolean;
    category: { id: string; name: string };
  }): AdminProduct {
    return {
      id: product.id,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      available: product.available,
    };
  }
}
