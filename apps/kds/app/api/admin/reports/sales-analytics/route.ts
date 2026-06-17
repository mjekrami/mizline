import { kitchenProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const path = query
    ? `/reports/sales-analytics?${query}`
    : "/reports/sales-analytics";
  return kitchenProxy(path, request);
}
