import { adminProxy } from "@/lib/api/proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const body = await request.json();
  return adminProxy(`/modifier-groups/${groupId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  return adminProxy(`/modifier-groups/${groupId}`, request, { method: "DELETE" });
}
