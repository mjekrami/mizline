"use client";

import type { AuthUser, LoginRequest, LoginResponse } from "@mizline/shared";

let accessToken: string | null = null;
let currentUser: AuthUser | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAuthUser(): AuthUser | null {
  return currentUser;
}

export function setAuthSession(token: string, user: AuthUser) {
  accessToken = token;
  currentUser = user;
}

export function clearAuthSession() {
  accessToken = null;
  currentUser = null;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        clearAuthSession();
        return null;
      }

      const data = (await response.json()) as LoginResponse;
      setAuthSession(data.accessToken, data.user);
      return data.accessToken;
    } catch {
      clearAuthSession();
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    let response = await fetch(input, {
      ...init,
      headers,
      credentials: "include",
    });

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers.set("Authorization", `Bearer ${refreshed}`);
        response = await fetch(input, {
          ...init,
          headers,
          credentials: "include",
        });
      }
    }

    return response;
  } catch {
    throw new Error("Could not reach the waiter API route.");
  }
}

export async function loginStaff(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || "Login failed");
  }

  const data = (await response.json()) as LoginResponse;
  setAuthSession(data.accessToken, data.user);
  return data;
}

export async function logoutStaff(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  clearAuthSession();
}

export async function loadAuthSession(): Promise<AuthUser | null> {
  if (currentUser && accessToken) {
    return currentUser;
  }

  const token = await refreshAccessToken();
  if (!token) {
    return null;
  }

  const response = await authFetch("/api/auth/me");
  if (!response.ok) {
    clearAuthSession();
    return null;
  }

  const user = (await response.json()) as AuthUser;
  currentUser = user;
  return user;
}

export function resolveStaffStoreId(user: AuthUser | null): string | undefined {
  if (user?.storeIds?.[0]) {
    return user.storeIds[0];
  }

  return process.env.NEXT_PUBLIC_KITCHEN_STORE_ID;
}
