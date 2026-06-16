import { adminProxy } from "@/lib/admin-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const body = await request.json();
  return adminProxy(`/products/${productId}/variants`, request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
