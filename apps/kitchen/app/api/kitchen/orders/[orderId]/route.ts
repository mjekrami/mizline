import type { Order } from "@mizline/shared";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { orderId } = await context.params;

  const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    return NextResponse.json(
      { error: message || "Failed to load order" },
      { status: response.status },
    );
  }

  const order = (await response.json()) as Order;
  return NextResponse.json(order);
}
