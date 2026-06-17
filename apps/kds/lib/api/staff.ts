import type { StaffMember } from "@mizline/shared";
import { clientApiFetch } from "./fetch";

export function fetchStaffMembers(): Promise<StaffMember[]> {
  return clientApiFetch("/api/admin/staff");
}

export function createStaffMember(data: {
  email: string;
  name: string;
  role: StaffMember["role"];
  password: string;
}): Promise<StaffMember> {
  return clientApiFetch("/api/admin/staff", {
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
  return clientApiFetch(`/api/admin/staff/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteStaffMember(userId: string): Promise<void> {
  return clientApiFetch(`/api/admin/staff/${userId}`, {
    method: "DELETE",
  });
}
