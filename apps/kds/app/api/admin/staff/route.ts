import { kitchenProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return kitchenProxy("/staff", request);
}

export async function POST(request: Request) {
  const body = await request.json();
  return kitchenProxy("/staff", request, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
