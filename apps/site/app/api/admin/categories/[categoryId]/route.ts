import { adminProxy } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const body = await request.json();
  return adminProxy(`/categories/${categoryId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  return adminProxy(`/categories/${categoryId}`, request, { method: "DELETE" });
}
