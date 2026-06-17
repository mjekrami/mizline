import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getDevKitchenToken,
  isDevFallbackEnabled,
  REFRESH_COOKIE,
} from "@/lib/auth/constants";
import { getStaffPathPrefix, parseWaiterPath } from "@/lib/waiter-path";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { section, staffPath } = parseWaiterPath(pathname);

  if (
    section !== "board" ||
    !staffPath ||
    staffPath !== getStaffPathPrefix()
  ) {
    return NextResponse.next();
  }

  const hasRefreshCookie = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const hasDevFallback =
    isDevFallbackEnabled() && Boolean(getDevKitchenToken());

  if (hasRefreshCookie || hasDevFallback) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${staffPath}/login`;
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
