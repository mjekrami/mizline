import { authFetch } from "@/lib/auth/session";

export async function clientApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await authFetch(path, init);

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    let message = text;
    try {
      const parsed = JSON.parse(text) as { error?: string; message?: string };
      message = parsed.error ?? parsed.message ?? text;
    } catch {
      // Response was plain text.
    }
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
