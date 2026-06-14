import type { Order } from "@mizline/shared";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

interface RouteContext {
  params: Promise<{ orderId: string; itemId: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  const token = process.env.KITCHEN_DEV_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "KITCHEN_DEV_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const { orderId, itemId } = await context.params;

  const response = await fetch(
    `${API_BASE}/api/orders/${orderId}/items/${itemId}/fulfill`,
    {
      method: "PATCH",
      headers: {
        "x-kitchen-dev-token": token,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    return NextResponse.json(
      { error: message || "Failed to hand off item" },
      { status: response.status },
    );
  }

  const order = (await response.json()) as Order;
  return NextResponse.json(order);
}
