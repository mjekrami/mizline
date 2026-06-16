import type { AuthUser, LoginResponse } from "@mizline/shared";
import { cookies } from "next/headers";
import {
  getApiBaseUrl,
  getDevKitchenToken,
  isDevFallbackEnabled,
  REFRESH_COOKIE,
} from "./auth-constants";

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    if (isDevFallbackEnabled() && getDevKitchenToken()) {
      return null;
    }
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as LoginResponse;
  return data.accessToken;
}

export async function getServerAuthUser(): Promise<AuthUser | null> {
  const accessToken = await getServerAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthUser>;
}

export function buildStaffAuthHeaders(accessToken: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
    return headers;
  }

  if (isDevFallbackEnabled()) {
    const devToken = getDevKitchenToken();
    if (devToken) {
      headers["x-kitchen-dev-token"] = devToken;
    }
  }

  return headers;
}

export async function getAccessTokenFromRequest(
  request: Request,
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return getServerAccessToken();
}
