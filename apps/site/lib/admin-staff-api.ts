import type { StaffMember } from "@mizline/shared";
import { authFetch } from "./auth-session";

async function staffFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authFetch(path, init);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchStaffMembers(): Promise<StaffMember[]> {
  return staffFetch("/api/admin/staff");
}

export function createStaffMember(data: {
  email: string;
  name: string;
  role: StaffMember["role"];
  password: string;
}): Promise<StaffMember> {
  return staffFetch("/api/admin/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStaffMember(
  userId: string,
  data: Partial<{
    name: string;
    role: StaffMember["role"];
    active: boolean;
    password: string;
  }>,
): Promise<StaffMember> {
  return staffFetch(`/api/admin/staff/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
