import { kitchenProxy } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return kitchenProxy("/settings", request);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return kitchenProxy("/settings", request, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
