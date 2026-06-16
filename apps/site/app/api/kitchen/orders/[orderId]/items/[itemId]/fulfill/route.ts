import { staffProxy } from "@/lib/staff-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string; itemId: string }> },
) {
  const { orderId, itemId } = await params;
  return staffProxy(
    `/api/orders/${orderId}/items/${itemId}/fulfill`,
    request,
    { method: "PATCH" },
  );
}
