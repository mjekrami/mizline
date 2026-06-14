import type { Order, OrderStatus } from "@mizline/shared";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const token = process.env.KITCHEN_DEV_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "KITCHEN_DEV_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const { orderId } = await context.params;
  const body = (await request.json()) as { status?: OrderStatus };

  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-kitchen-dev-token": token,
    },
    body: JSON.stringify({ status: body.status }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    return NextResponse.json(
      { error: message || "Failed to update order" },
      { status: response.status },
    );
  }

  const order = (await response.json()) as Order;
  return NextResponse.json(order);
}
