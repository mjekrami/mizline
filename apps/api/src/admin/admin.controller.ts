import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { KitchenDevTokenGuard } from "../common/guards/kitchen-dev-token.guard";
import { AdminService } from "./admin.service";
import {
  CreateCategoryDto,
  CreateProductDto,
  CreateTableDto,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateTableDto,
} from "./dto/admin.dto";

@Controller("stores/:storeId/admin")
@UseGuards(KitchenDevTokenGuard)
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
