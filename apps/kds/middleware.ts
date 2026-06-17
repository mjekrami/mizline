import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDevKitchenToken,
  isDevFallbackEnabled,
  REFRESH_COOKIE,
} from "@/lib/auth/constants";
import { isStaffSection, parseStaffPath } from "@/lib/staff-path";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { section, staffPath } = parseStaffPath(pathname);

  if (section === "login") {
    return NextResponse.next();
  }

  if (!isStaffSection(section)) {
    return NextResponse.next();
  }

  const hasRefreshCookie = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const hasDevFallback =
    isDevFallbackEnabled() && Boolean(getDevKitchenToken());

  if (hasRefreshCookie || hasDevFallback) {
    return NextResponse.next();
  }

  if (!staffPath) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${staffPath}/login`;
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/:path/kitchen/:path*",
    "/:path/admin/:path*",
    "/:path/login",
  ],
};
