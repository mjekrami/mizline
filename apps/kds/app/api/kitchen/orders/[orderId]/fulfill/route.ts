import { staffProxy } from "@/lib/api/proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  return staffProxy(`/api/orders/${orderId}/fulfill`, request, {
    method: "PATCH",
  });
}
