import { adminProxy } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ productId: string; variantId: string }> },
) {
  const { productId, variantId } = await params;
  const body = await request.json();
  return adminProxy(`/products/${productId}/variants/${variantId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ productId: string; variantId: string }> },
) {
  const { productId, variantId } = await params;
  return adminProxy(`/products/${productId}/variants/${variantId}`, {
    method: "DELETE",
  });
}
