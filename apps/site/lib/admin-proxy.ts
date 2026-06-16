import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

function adminConfig() {
  const storeId = process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;
  const token = process.env.KITCHEN_DEV_TOKEN;

  if (!storeId) {
    return {
      error: NextResponse.json(
        { error: "NEXT_PUBLIC_KITCHEN_STORE_ID is not configured" },
        { status: 500 },
      ),
    };
  }

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "KITCHEN_DEV_TOKEN is not configured" },
        { status: 500 },
      ),
    };
  }

  return { storeId, token };
}

export async function adminProxy(path: string, init?: RequestInit) {
  const config = adminConfig();
  if ("error" in config) {
    return config.error;
  }

  const response = await fetch(
    `${API_BASE}/api/stores/${config.storeId}/admin${path}`,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-kitchen-dev-token": config.token,
        ...init?.headers,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    return NextResponse.json(
      { error: message || "Admin request failed" },
      { status: response.status },
    );
  }

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await response.text();
  if (!text) {
    return new NextResponse(null, { status: response.status });
  }

  return NextResponse.json(JSON.parse(text) as unknown);
}

export function adminProxyConfig() {
  return adminConfig();
}
