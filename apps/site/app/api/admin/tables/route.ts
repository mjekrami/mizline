import { adminProxy } from "@/lib/admin-proxy";

export async function GET() {
  return adminProxy("/tables");
}

export async function POST(request: Request) {
  const body = await request.json();
  return adminProxy("/tables", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
