import { NextResponse } from "next/server";
import { getAccessTokenFromRequest, buildStaffAuthHeaders } from "@/lib/auth/server";
import { getApiBaseUrl } from "@/lib/auth/constants";

export async function GET(request: Request) {
  const accessToken = await getAccessTokenFromRequest(request);
  const headers = buildStaffAuthHeaders(accessToken);

  if (!accessToken && !("x-kitchen-dev-token" in headers)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Unauthorized");
    return NextResponse.json({ error: message }, { status: response.status });
  }

  return NextResponse.json(await response.json());
}
