import { kitchenProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const statuses = ["new", "preparing", "ready", "fulfilled"];
  const query = new URLSearchParams({ status: statuses.join(",") });
  return kitchenProxy(`/orders?${query.toString()}`, request);
}
