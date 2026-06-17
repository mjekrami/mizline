import { NextResponse } from "next/server";
import { getAccessTokenFromRequest, buildStaffAuthHeaders } from "@/lib/auth/server";
import {
  API_UNREACHABLE_MESSAGE,
  getApiBaseUrl,
  getStaffStoreId,
} from "@/lib/auth/constants";

export async function staffProxy(
  apiPath: string,
  request: Request,
  init?: RequestInit,
) {
  const storeId = getStaffStoreId();
  if (!storeId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_KITCHEN_STORE_ID is not configured" },
      { status: 500 },
    );
  }

  const accessToken = await getAccessTokenFromRequest(request);
  const headers = buildStaffAuthHeaders(accessToken);

  if (!accessToken && !("x-kitchen-dev-token" in headers)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${apiPath}`, {
      ...init,
      headers: {
        ...headers,
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: API_UNREACHABLE_MESSAGE }, { status: 503 });
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    return NextResponse.json(
      { error: message || "Request failed" },
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

export async function waiterProxy(path: string, request: Request, init?: RequestInit) {
  const storeId = getStaffStoreId();
  if (!storeId) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_KITCHEN_STORE_ID is not configured" },
      { status: 500 },
    );
  }

  return staffProxy(`/api/stores/${storeId}/waiter${path}`, request, init);
}
