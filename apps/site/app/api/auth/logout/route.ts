import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl, REFRESH_COOKIE } from "@/lib/auth/constants";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
      },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
