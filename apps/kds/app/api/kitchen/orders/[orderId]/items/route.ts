import { staffProxy } from "@/lib/api/proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const body = await request.json();
  return staffProxy(`/api/orders/${orderId}/items`, request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
