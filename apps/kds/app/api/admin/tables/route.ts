import { adminProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return adminProxy("/tables", request);
}

export async function POST(request: Request) {
  const body = await request.json();
  return adminProxy("/tables", request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
