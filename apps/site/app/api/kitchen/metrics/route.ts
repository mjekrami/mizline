import type { KitchenMetrics } from "@mizline/shared";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

export async function GET() {
  const storeId = process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;
  const token = process.env.KITCHEN_DEV_TOKEN;

  if (!storeId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_KITCHEN_STORE_ID is not configured" },
      { status: 500 },
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "KITCHEN_DEV_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const response = await fetch(
    `${API_BASE}/api/stores/${storeId}/orders/metrics`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-kitchen-dev-token": token,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    return NextResponse.json(
      { error: message || "Failed to load kitchen metrics" },
      { status: response.status },
    );
  }

  const metrics = (await response.json()) as KitchenMetrics;
  return NextResponse.json(metrics);
}
