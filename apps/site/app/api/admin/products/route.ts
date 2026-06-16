import { adminProxy } from "@/lib/api/proxy";

export async function POST(request: Request) {
  const body = await request.json();
  return adminProxy("/products", request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
