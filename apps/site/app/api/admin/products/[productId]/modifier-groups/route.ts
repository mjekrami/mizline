import { adminProxy } from "@/lib/admin-proxy";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const body = await request.json();
  return adminProxy(`/products/${productId}/modifier-groups`, request, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
