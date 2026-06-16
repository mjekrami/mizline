import { adminProxy } from "@/lib/api/proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const body = await request.json();
  return adminProxy(`/products/${productId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  return adminProxy(`/products/${productId}`, request, { method: "DELETE" });
}
