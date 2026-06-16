import { kitchenProxy } from "@/lib/staff-proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query
    ? `/reports/hourly-activity?${query}`
    : "/reports/hourly-activity";
  return kitchenProxy(path, request);
}
