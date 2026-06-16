import { adminProxy } from "@/lib/admin-proxy";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ groupId: string; optionId: string }> },
) {
  const { groupId, optionId } = await params;
  const body = await request.json();
  return adminProxy(`/modifier-groups/${groupId}/options/${optionId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  request: Request,
  {
    params,
  }: { params: Promise<{ groupId: string; optionId: string }> },
) {
  const { groupId, optionId } = await params;
  return adminProxy(`/modifier-groups/${groupId}/options/${optionId}`, request, {
    method: "DELETE",
  });
}
