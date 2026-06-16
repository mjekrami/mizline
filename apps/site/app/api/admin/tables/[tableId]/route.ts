import { adminProxy } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  const { tableId } = await params;
  const body = await request.json();
  return adminProxy(`/tables/${tableId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
