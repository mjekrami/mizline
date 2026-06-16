import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  RolesGuard,
  TenantGuard,
} from "../auth/guards/auth.guards";
import { StaffAuthGuard } from "../auth/guards/staff-auth.guard";
import { AdminService } from "./admin.service";
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

@Controller("stores/:storeId/admin")
@UseGuards(StaffAuthGuard, RolesGuard, TenantGuard)
@Roles("manager")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("catalog")
  getCatalog(@Param("storeId") storeId: string) {
    return this.adminService.getCatalog(storeId);
  }

  @Get("tables")
  listTables(@Param("storeId") storeId: string) {
    return this.adminService.listTables(storeId);
  }

  @Post("categories")
  createCategory(
    @Param("storeId") storeId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.adminService.createCategory(storeId, dto);
  }

  @Patch("categories/:categoryId")
  updateCategory(
    @Param("storeId") storeId: string,
    @Param("categoryId") categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(storeId, categoryId, dto);
  }

  @Delete("categories/:categoryId")
  deleteCategory(
    @Param("storeId") storeId: string,
    @Param("categoryId") categoryId: string,
  ) {
    return this.adminService.deleteCategory(storeId, categoryId);
  }

  @Post("products")
  createProduct(
    @Param("storeId") storeId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.adminService.createProduct(storeId, dto);
  }

  @Patch("products/:productId")
  updateProduct(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.adminService.updateProduct(storeId, productId, dto);
  }

  @Delete("products/:productId")
  deleteProduct(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
  ) {
    return this.adminService.deleteProduct(storeId, productId);
  }

  @Post("products/:productId/variants")
  createVariant(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.adminService.createVariant(storeId, productId, dto);
  }

  @Patch("products/:productId/variants/:variantId")
  updateVariant(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
    @Param("variantId") variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.adminService.updateVariant(storeId, productId, variantId, dto);
  }

  @Delete("products/:productId/variants/:variantId")
  deleteVariant(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
    @Param("variantId") variantId: string,
  ) {
    return this.adminService.deleteVariant(storeId, productId, variantId);
  }

  @Put("products/:productId/modifier-groups")
  setProductModifierGroups(
    @Param("storeId") storeId: string,
    @Param("productId") productId: string,
    @Body() dto: SetProductModifierGroupsDto,
  ) {
    return this.adminService.setProductModifierGroups(storeId, productId, dto);
  }

  @Post("modifier-groups")
  createModifierGroup(
    @Param("storeId") storeId: string,
    @Body() dto: CreateModifierGroupDto,
  ) {
    return this.adminService.createModifierGroup(storeId, dto);
  }

  @Patch("modifier-groups/:groupId")
  updateModifierGroup(
    @Param("storeId") storeId: string,
    @Param("groupId") groupId: string,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.adminService.updateModifierGroup(storeId, groupId, dto);
  }

  @Delete("modifier-groups/:groupId")
  deleteModifierGroup(
    @Param("storeId") storeId: string,
    @Param("groupId") groupId: string,
  ) {
    return this.adminService.deleteModifierGroup(storeId, groupId);
  }

  @Post("modifier-groups/:groupId/options")
  createModifierOption(
    @Param("storeId") storeId: string,
    @Param("groupId") groupId: string,
    @Body() dto: CreateModifierOptionDto,
  ) {
    return this.adminService.createModifierOption(storeId, groupId, dto);
  }

  @Patch("modifier-groups/:groupId/options/:optionId")
  updateModifierOption(
    @Param("storeId") storeId: string,
    @Param("groupId") groupId: string,
    @Param("optionId") optionId: string,
    @Body() dto: UpdateModifierOptionDto,
  ) {
    return this.adminService.updateModifierOption(
      storeId,
      groupId,
      optionId,
      dto,
    );
  }

  @Delete("modifier-groups/:groupId/options/:optionId")
  deleteModifierOption(
    @Param("storeId") storeId: string,
    @Param("groupId") groupId: string,
    @Param("optionId") optionId: string,
  ) {
    return this.adminService.deleteModifierOption(storeId, groupId, optionId);
  }

  @Post("tables")
  createTable(
    @Param("storeId") storeId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.adminService.createTable(storeId, dto);
  }

  @Patch("tables/:tableId")
  updateTable(
    @Param("storeId") storeId: string,
    @Param("tableId") tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.adminService.updateTable(storeId, tableId, dto);
  }
}
