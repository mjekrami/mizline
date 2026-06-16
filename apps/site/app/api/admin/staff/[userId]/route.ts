import { staffProxy } from "@/lib/staff-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const body = await request.json();
  return staffProxy(`/api/staff/${userId}`, request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
