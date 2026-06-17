import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import type {
  DailySalesSummary,
  HourlyActivityReport,
  SalesAnalyticsDashboard,
  StoreSettings,
} from "@mizline/shared";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import {
  JwtAuthGuard,
  RolesGuard,
  TenantGuard,
} from "../auth/guards/auth.guards";
import { ReportsService } from "./reports.service";
import { UpdateStoreSettingsDto } from "./dto/store-settings.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("stores/:storeId/reports/daily-summary")
  @Roles("manager")
  getDailySummary(
    @Param("storeId") storeId: string,
    @Query("date") date: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DailySalesSummary> {
    return this.reportsService.getDailySummary(user.tenantId, storeId, date);
  }

  @Get("stores/:storeId/reports/sales-analytics")
  @Roles("manager")
  getSalesAnalytics(
    @Param("storeId") storeId: string,
    @Query("startDate") startDate: string | undefined,
    @Query("endDate") endDate: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SalesAnalyticsDashboard> {
    return this.reportsService.getSalesAnalytics(
      user.tenantId,
      storeId,
      startDate,
      endDate,
    );
  }

  @Get("stores/:storeId/reports/hourly-activity")
  @Roles("manager")
  getHourlyActivity(
    @Param("storeId") storeId: string,
    @Query("date") date: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HourlyActivityReport> {
    return this.reportsService.getHourlyActivity(user.tenantId, storeId, date);
  }

  @Get("stores/:storeId/settings")
  @Roles("manager")
  getStoreSettings(
    @Param("storeId") storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StoreSettings> {
    return this.reportsService.getStoreSettings(user.tenantId, storeId);
  }

  @Patch("stores/:storeId/settings")
  @Roles("manager")
  updateStoreSettings(
    @Param("storeId") storeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStoreSettingsDto,
  ): Promise<StoreSettings> {
    return this.reportsService.updateStoreSettings(user.tenantId, storeId, dto);
  }
}
