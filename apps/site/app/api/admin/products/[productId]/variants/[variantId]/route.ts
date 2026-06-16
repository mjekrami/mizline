import { adminProxy } from "@/lib/api/proxy";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ productId: string; variantId: string }> },
) {
  const { productId, variantId } = await params;
  const body = await request.json();
  return adminProxy(`/products/${productId}/variants/${variantId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: Promise<{ productId: string; variantId: string }> },
) {
  const { productId, variantId } = await params;
  return adminProxy(`/products/${productId}/variants/${variantId}`, request, {
    method: "DELETE",
  });
}
