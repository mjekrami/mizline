import { Controller, Get, Param } from "@nestjs/common";
import { StoresService } from "./stores.service";

@Controller("stores")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get(":storeId")
  getStore(@Param("storeId") storeId: string) {
    return this.storesService.getStore(storeId);
  }

  @Get(":storeId/menu")
  getMenu(@Param("storeId") storeId: string) {
    return this.storesService.getMenu(storeId);
  }

  @Get(":storeId/tables/:tableId")
  getTable(
    @Param("storeId") storeId: string,
    @Param("tableId") tableId: string,
  ) {
    return this.storesService.getTable(storeId, tableId);
  }
}
