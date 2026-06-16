import type { LoginRequest, LoginResponse } from "@mizline/shared";
import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/auth/constants";
import { setRefreshCookie } from "@/lib/auth/cookie";

type AuthApiLoginResponse = LoginResponse & { refreshToken?: string };

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;
  const secure = request.url.startsWith("https://");

  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Login failed");
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const data = (await response.json()) as AuthApiLoginResponse;
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
