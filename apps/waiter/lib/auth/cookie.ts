import { REFRESH_COOKIE } from "./constants";

export function refreshCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}

export function setRefreshCookie(
  response: {
    cookies: {
      set: (
        name: string,
        value: string,
        options: ReturnType<typeof refreshCookieOptions>,
      ) => void;
    };
  },
  refreshToken: string,
  secure: boolean,
) {
  response.cookies.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions(secure));
}
