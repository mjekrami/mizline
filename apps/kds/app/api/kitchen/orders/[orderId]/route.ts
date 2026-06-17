import { staffProxy } from "@/lib/api/proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  return staffProxy(`/api/orders/${orderId}`, request);
}
