import { kitchenProxy } from "@/lib/staff-proxy";

export async function GET(request: Request) {
  return kitchenProxy("/orders/metrics", request);
}
