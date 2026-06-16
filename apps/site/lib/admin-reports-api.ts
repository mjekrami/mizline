import type { DailySalesSummary, HourlyActivityReport, StoreSettings } from "@mizline/shared";
import { authFetch } from "./auth-session";

async function reportsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authFetch(path, init);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function fetchDailySummary(date?: string): Promise<DailySalesSummary> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return reportsFetch(`/api/admin/reports/daily-summary${query}`);
}

export function fetchHourlyActivity(date?: string): Promise<HourlyActivityReport> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return reportsFetch(`/api/admin/reports/hourly-activity${query}`);
}

export function fetchStoreSettings(): Promise<StoreSettings> {
  return reportsFetch("/api/admin/settings");
}

export function updateStoreSettings(
  settings: StoreSettings,
): Promise<StoreSettings> {
  return reportsFetch("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}
