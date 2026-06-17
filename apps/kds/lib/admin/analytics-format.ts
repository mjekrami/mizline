import type { AnalyticsDateRange } from "@mizline/shared";

function parseDate(ymd: string) {
  return new Date(`${ymd}T12:00:00.000Z`);
}

export function formatShortDate(ymd: string, includeYear = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(parseDate(ymd));
}

function formatAnalyticsDateRange(startDate: string, endDate: string) {
  const sameYear =
    parseDate(startDate).getUTCFullYear() === parseDate(endDate).getUTCFullYear();

  return `${formatShortDate(startDate)} – ${formatShortDate(endDate, !sameYear || startDate.slice(0, 4) !== endDate.slice(0, 4))}`;
}

export function formatComparisonLabel(range: AnalyticsDateRange) {
  return `vs ${formatAnalyticsDateRange(range.comparisonStartDate, range.comparisonEndDate)}`;
}

function todayYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftDate(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export type AnalyticsDatePresetId =
  | "today"
  | "7d"
  | "14d"
  | "30d"
  | "this-month";

export interface AnalyticsDateRangeSelection {
  startDate: string;
  endDate: string;
}

export interface AnalyticsDatePreset {
  id: AnalyticsDatePresetId;
  label: string;
  getRange: () => AnalyticsDateRangeSelection;
}

export const ANALYTICS_DATE_PRESETS: AnalyticsDatePreset[] = [
  {
    id: "today",
    label: "Today",
    getRange: () => {
      const endDate = todayYmd();
      return { startDate: endDate, endDate };
    },
  },
  {
    id: "7d",
    label: "Last 7 days",
    getRange: defaultAnalyticsRange,
  },
  {
    id: "14d",
    label: "Last 14 days",
    getRange: () => {
      const endDate = todayYmd();
      return { startDate: shiftDate(endDate, -13), endDate };
    },
  },
  {
    id: "30d",
    label: "Last 30 days",
    getRange: () => {
      const endDate = todayYmd();
      return { startDate: shiftDate(endDate, -29), endDate };
    },
  },
  {
    id: "this-month",
    label: "This month",
    getRange: () => {
      const endDate = todayYmd();
      return { startDate: endDate.slice(0, 8) + "01", endDate };
    },
  },
];

export function defaultAnalyticsRange(): AnalyticsDateRangeSelection {
  const endDate = todayYmd();
  return { startDate: shiftDate(endDate, -6), endDate };
}

export function formatHourLabel(hour: number) {
  if (hour === 0 || hour === 24) return "12AM";
  if (hour === 12) return "12PM";
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

export function formatCompactCurrency(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars >= 10_000 ? 0 : 1)}K`;
  }
  return `$${Math.round(dollars)}`;
}
