import { staffProxy } from "@/lib/staff-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const body = await request.json();
  return staffProxy(`/api/orders/${orderId}/status`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
