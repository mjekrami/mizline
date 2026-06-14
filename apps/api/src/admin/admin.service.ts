import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AdminCatalog,
  AdminModifierGroup,
  AdminModifierOption,
  AdminProduct,
  AdminProductVariant,
  AdminTable,
} from "@mizline/shared";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCategoryDto,
  CreateModifierGroupDto,
  CreateModifierOptionDto,
  CreateProductDto,
  CreateTableDto,
  CreateVariantDto,
  SetProductModifierGroupsDto,
  UpdateCategoryDto,
  UpdateModifierGroupDto,
  UpdateModifierOptionDto,
  UpdateProductDto,
  UpdateTableDto,
  UpdateVariantDto,
} from "./dto/admin.dto";

type ProductWithAdminRelations = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  available: boolean;
  category: { id: string; name: string };
  variants: Array<{ id: string; name: string; priceModifier: number }>;
  modifierGroups: Array<{ groupId: string }>;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalog(storeId: string): Promise<AdminCatalog> {
    await this.assertStore(storeId);

    const [categories, products, modifierGroups] = await Promise.all([
      this.prisma.category.findMany({
        where: { storeId },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      }),
      this.prisma.product.findMany({
        where: { category: { storeId } },
        orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
        include: {
          category: { select: { id: true, name: true } },
          variants: { orderBy: { name: "asc" } },
          modifierGroups: { select: { groupId: true } },
        },
      }),
      this.prisma.modifierGroup.findMany({
        where: { storeId },
        orderBy: { sortOrder: "asc" },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      }),
    ]);

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder,
        productCount: category._count.products,
      })),
      products: products.map((product) => this.toAdminProduct(product)),
      modifierGroups: modifierGroups.map((group) => this.toAdminModifierGroup(group)),
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
      include: this.productInclude(),
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
      include: this.productInclude(),
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

  async createVariant(
    storeId: string,
    productId: string,
    dto: CreateVariantDto,
  ): Promise<AdminProductVariant> {
    await this.assertProductInStore(storeId, productId);

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name.trim(),
        priceModifier: dto.priceModifier,
      },
    });

    return {
      id: variant.id,
      name: variant.name,
      priceModifier: variant.priceModifier,
    };
  }

  async updateVariant(
    storeId: string,
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ): Promise<AdminProductVariant> {
    await this.assertVariantInProduct(storeId, productId, variantId);

    const variant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.priceModifier !== undefined
          ? { priceModifier: dto.priceModifier }
          : {}),
      },
    });

    return {
      id: variant.id,
      name: variant.name,
      priceModifier: variant.priceModifier,
    };
  }

  async deleteVariant(
    storeId: string,
    productId: string,
    variantId: string,
  ) {
    await this.assertVariantInProduct(storeId, productId, variantId);

    const orderItemCount = await this.prisma.orderItem.count({
      where: { variantId },
    });

    if (orderItemCount > 0) {
      throw new ConflictException(
        "Cannot delete a variant that appears on past orders",
      );
    }

    await this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async createModifierGroup(
    storeId: string,
    dto: CreateModifierGroupDto,
  ): Promise<AdminModifierGroup> {
    await this.assertStore(storeId);

    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.modifierGroup.count({ where: { storeId } }));

    const group = await this.prisma.modifierGroup.create({
      data: {
        storeId,
        name: dto.name.trim(),
        minSelect: dto.minSelect ?? 0,
        maxSelect: dto.maxSelect ?? 1,
        sortOrder,
      },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });

    return this.toAdminModifierGroup(group);
  }

  async updateModifierGroup(
    storeId: string,
    groupId: string,
    dto: UpdateModifierGroupDto,
  ): Promise<AdminModifierGroup> {
    await this.assertModifierGroupInStore(storeId, groupId);

    const group = await this.prisma.modifierGroup.update({
      where: { id: groupId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.minSelect !== undefined ? { minSelect: dto.minSelect } : {}),
        ...(dto.maxSelect !== undefined ? { maxSelect: dto.maxSelect } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });

    return this.toAdminModifierGroup(group);
  }

  async deleteModifierGroup(storeId: string, groupId: string) {
    await this.assertModifierGroupInStore(storeId, groupId);
    await this.prisma.modifierGroup.delete({ where: { id: groupId } });
  }

  async createModifierOption(
    storeId: string,
    groupId: string,
    dto: CreateModifierOptionDto,
  ): Promise<AdminModifierOption> {
    await this.assertModifierGroupInStore(storeId, groupId);

    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.modifierOption.count({ where: { groupId } }));

    const option = await this.prisma.modifierOption.create({
      data: {
        groupId,
        name: dto.name.trim(),
        priceModifier: dto.priceModifier,
        available: dto.available ?? true,
        sortOrder,
      },
    });

    return this.toAdminModifierOption(option);
  }

  async updateModifierOption(
    storeId: string,
    groupId: string,
    optionId: string,
    dto: UpdateModifierOptionDto,
  ): Promise<AdminModifierOption> {
    await this.assertModifierOptionInGroup(storeId, groupId, optionId);

    const option = await this.prisma.modifierOption.update({
      where: { id: optionId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.priceModifier !== undefined
          ? { priceModifier: dto.priceModifier }
          : {}),
        ...(dto.available !== undefined ? { available: dto.available } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return this.toAdminModifierOption(option);
  }

  async deleteModifierOption(
    storeId: string,
    groupId: string,
    optionId: string,
  ) {
    await this.assertModifierOptionInGroup(storeId, groupId, optionId);
    await this.prisma.modifierOption.delete({ where: { id: optionId } });
  }

  async setProductModifierGroups(
    storeId: string,
    productId: string,
    dto: SetProductModifierGroupsDto,
  ): Promise<AdminProduct> {
    await this.assertProductInStore(storeId, productId);

    for (const groupId of dto.groupIds) {
      await this.assertModifierGroupInStore(storeId, groupId);
    }

    await this.prisma.$transaction([
      this.prisma.productModifierGroup.deleteMany({ where: { productId } }),
      ...dto.groupIds.map((groupId, index) =>
        this.prisma.productModifierGroup.create({
          data: {
            productId,
            groupId,
            sortOrder: index,
          },
        }),
      ),
    ]);

    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: this.productInclude(),
    });

    return this.toAdminProduct(product);
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

  private productInclude() {
    return {
      category: { select: { id: true, name: true } },
      variants: { orderBy: { name: "asc" as const } },
      modifierGroups: { select: { groupId: true } },
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

  private async assertVariantInProduct(
    storeId: string,
    productId: string,
    variantId: string,
  ) {
    await this.assertProductInStore(storeId, productId);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException("Variant not found");
    }

    return variant;
  }

  private async assertModifierGroupInStore(storeId: string, groupId: string) {
    const group = await this.prisma.modifierGroup.findFirst({
      where: { id: groupId, storeId },
    });

    if (!group) {
      throw new NotFoundException("Modifier group not found");
    }

    return group;
  }

  private async assertModifierOptionInGroup(
    storeId: string,
    groupId: string,
    optionId: string,
  ) {
    await this.assertModifierGroupInStore(storeId, groupId);

    const option = await this.prisma.modifierOption.findFirst({
      where: { id: optionId, groupId },
    });

    if (!option) {
      throw new NotFoundException("Modifier option not found");
    }

    return option;
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

  private toAdminProduct(product: ProductWithAdminRelations): AdminProduct {
    return {
      id: product.id,
      categoryId: product.categoryId,
      categoryName: product.category.name,
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
      modifierGroupIds: product.modifierGroups.map((link) => link.groupId),
    };
  }

  private toAdminModifierGroup(group: {
    id: string;
    name: string;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    options: Array<{
      id: string;
      name: string;
      priceModifier: number;
      available: boolean;
      sortOrder: number;
    }>;
  }): AdminModifierGroup {
    return {
      id: group.id,
      name: group.name,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      sortOrder: group.sortOrder,
      options: group.options.map((option) => this.toAdminModifierOption(option)),
    };
  }

  private toAdminModifierOption(option: {
    id: string;
    name: string;
    priceModifier: number;
    available: boolean;
    sortOrder: number;
  }): AdminModifierOption {
    return {
      id: option.id,
      name: option.name,
      priceModifier: option.priceModifier,
      available: option.available,
      sortOrder: option.sortOrder,
    };
  }
}
