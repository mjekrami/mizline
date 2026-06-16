import { getApiBaseUrl } from "@/lib/auth/constants";

export async function POST(
  _request: Request,
  context: { params: Promise<{ storeId: string; tableId: string }> },
) {
  const { storeId, tableId } = await context.params;

  const response = await fetch(
    `${getApiBaseUrl()}/api/stores/${storeId}/tables/${tableId}/call-waiter`,
    { method: "POST" },
  );

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
