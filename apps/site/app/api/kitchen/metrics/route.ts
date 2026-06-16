import { kitchenProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return kitchenProxy("/orders/metrics", request);
}
