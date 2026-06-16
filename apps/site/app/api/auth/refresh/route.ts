import type { LoginResponse } from "@mizline/shared";
import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl, REFRESH_COOKIE } from "@/lib/auth-constants";
import { setRefreshCookie } from "@/lib/refresh-cookie";

type AuthApiRefreshResponse = LoginResponse & { refreshToken?: string };

export async function POST(request: NextRequest) {
  const secure = request.url.startsWith("https://");
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
    },
  });

  if (!response.ok) {
    const nextResponse = NextResponse.json(
      { error: "Session expired" },
      { status: 401 },
    );
    nextResponse.cookies.delete(REFRESH_COOKIE);
    return nextResponse;
  }

  const data = (await response.json()) as AuthApiRefreshResponse;
  const clientPayload: LoginResponse = {
    accessToken: data.accessToken,
    user: data.user,
  };
  const nextResponse = NextResponse.json(clientPayload);

  if (data.refreshToken) {
    setRefreshCookie(nextResponse, data.refreshToken, secure);
  }

  return nextResponse;
}
