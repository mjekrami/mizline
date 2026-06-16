import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDevKitchenToken,
  isDevFallbackEnabled,
  REFRESH_COOKIE,
} from "@/lib/auth-constants";

function isStaffProtectedPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return false;

  const section = segments[1];
  return section === "kitchen" || section === "admin";
}

function isLoginPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 2 && segments[1] === "login";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLoginPath(pathname)) {
    return NextResponse.next();
  }

  if (!isStaffProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const hasRefreshCookie = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const hasDevFallback =
    isDevFallbackEnabled() && Boolean(getDevKitchenToken());

  if (hasRefreshCookie || hasDevFallback) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const staffPath = segments[0];
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${staffPath}/login`;
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/:path/kitchen/:path*", "/:path/admin/:path*", "/:path/login"],
};
