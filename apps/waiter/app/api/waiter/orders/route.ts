import { waiterProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return waiterProxy("/orders", request);
}
