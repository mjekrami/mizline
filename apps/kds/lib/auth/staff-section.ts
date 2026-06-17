import { redirect } from "next/navigation";
import {
  canAccessAdmin,
  canAccessKitchen,
} from "@mizline/shared";
import type { StaffRole } from "@mizline/shared";
import { getServerAuthUser } from "./server";

export async function redirectIfUnauthorizedStaffSection(
  staffPath: string,
  section: "kitchen" | "admin",
): Promise<void> {
  const user = await getServerAuthUser();
  if (!user) {
    return;
  }

  if (canAccessStaffSection(user.role, section)) {
    return;
  }

  redirect(defaultStaffHome(user.role, staffPath));
}

function canAccessStaffSection(
  role: StaffRole,
  section: "kitchen" | "admin",
): boolean {
  switch (section) {
    case "kitchen":
      return canAccessKitchen(role);
    case "admin":
      return canAccessAdmin(role);
  }
}

function defaultStaffHome(role: StaffRole, staffPath: string): string {
  if (canAccessAdmin(role)) {
    return `/${staffPath}/admin`;
  }

  if (canAccessKitchen(role)) {
    return `/${staffPath}/kitchen`;
  }

  return `/${staffPath}/login`;
}
