import { staffProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return staffProxy("/waiter/orders", request);
}
