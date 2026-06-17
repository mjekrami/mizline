import type {
  DailySalesSummary,
  HourlyActivityReport,
  SalesAnalyticsDashboard,
  StoreSettings,
} from "@mizline/shared";
import { clientApiFetch } from "./fetch";

export function fetchDailySummary(date?: string): Promise<DailySalesSummary> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return clientApiFetch(`/api/admin/reports/daily-summary${query}`);
}

export function fetchSalesAnalytics(
  startDate?: string,
  endDate?: string,
): Promise<SalesAnalyticsDashboard> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const query = params.toString();
  return clientApiFetch(
    `/api/admin/reports/sales-analytics${query ? `?${query}` : ""}`,
  );
}

export function fetchHourlyActivity(date?: string): Promise<HourlyActivityReport> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return clientApiFetch(`/api/admin/reports/hourly-activity${query}`);
}

export function fetchStoreSettings(): Promise<StoreSettings> {
  return clientApiFetch("/api/admin/settings");
}

export function updateStoreSettings(
  settings: StoreSettings,
): Promise<StoreSettings> {
  return clientApiFetch("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}
