import { staffProxy } from "@/lib/api/proxy";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  return staffProxy(`/waiter/orders/${orderId}`, request);
}
