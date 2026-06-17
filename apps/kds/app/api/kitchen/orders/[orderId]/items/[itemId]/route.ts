import { staffProxy } from "@/lib/api/proxy";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ orderId: string; itemId: string }> },
) {
  const { orderId, itemId } = await params;
  const body = await request.json();
  return staffProxy(`/api/orders/${orderId}/items/${itemId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: Promise<{ orderId: string; itemId: string }> },
) {
  const { orderId, itemId } = await params;
  return staffProxy(`/api/orders/${orderId}/items/${itemId}`, request, {
    method: "DELETE",
  });
}
