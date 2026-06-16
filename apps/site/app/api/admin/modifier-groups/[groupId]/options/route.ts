import { adminProxy } from "@/lib/admin-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const body = await request.json();
  return adminProxy(`/modifier-groups/${groupId}/options`, request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
