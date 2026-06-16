import { kitchenProxy } from "@/lib/staff-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query
    ? `/reports/daily-summary?${query}`
    : "/reports/daily-summary";
  return kitchenProxy(path, request);
}
