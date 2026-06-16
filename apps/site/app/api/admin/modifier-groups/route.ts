import { adminProxy } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const body = await request.json();
  return adminProxy("/modifier-groups", request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
