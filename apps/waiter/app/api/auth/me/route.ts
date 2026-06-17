import { NextResponse } from "next/server";
import { getAccessTokenFromRequest, buildStaffAuthHeaders } from "@/lib/auth/server";
import { API_UNREACHABLE_MESSAGE, getApiBaseUrl } from "@/lib/auth/constants";

export async function GET(request: Request) {
  const accessToken = await getAccessTokenFromRequest(request);
  const headers = buildStaffAuthHeaders(accessToken);

  if (!accessToken && !("x-kitchen-dev-token" in headers)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
      headers,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: API_UNREACHABLE_MESSAGE }, { status: 503 });
  }

  if (!response.ok) {
    const message = await response.text().catch(() => "Unauthorized");
    return NextResponse.json({ error: message }, { status: response.status });
  }

  return NextResponse.json(await response.json());
}
