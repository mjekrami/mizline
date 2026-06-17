import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl, API_REFRESH_COOKIE, REFRESH_COOKIE } from "@/lib/auth/constants";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `${API_REFRESH_COOKIE}=${refreshToken}`,
        },
      });
    } catch {
      // Best-effort remote logout; always clear the local cookie below.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
