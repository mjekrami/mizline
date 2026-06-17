import { waiterProxy } from "@/lib/api/proxy";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  return waiterProxy(`/orders/${orderId}`, request);
}
