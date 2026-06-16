import { redirect } from "next/navigation";
import {
  canAccessAdmin,
  canAccessKitchen,
  canAccessWaiter,
} from "@mizline/shared";
import type { StaffRole } from "@mizline/shared";
import { getServerAuthUser } from "./server";

export async function redirectIfUnauthorizedStaffSection(
  staffPath: string,
  section: "kitchen" | "admin" | "waiter",
): Promise<void> {
  const user = await getServerAuthUser();
  if (!user) {
    return;
  }

  if (canAccessStaffSection(user.role, section)) {
    return;
  }

  if (section === "waiter") {
    redirect(`/${staffPath}/login?next=/${staffPath}/waiter`);
  }

  redirect(defaultStaffHome(user.role, staffPath));
}

function canAccessStaffSection(
  role: StaffRole,
  section: "kitchen" | "admin" | "waiter",
): boolean {
  switch (section) {
    case "waiter":
      return canAccessWaiter(role);
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

  if (canAccessWaiter(role)) {
    return `/${staffPath}/waiter`;
  }

  return `/${staffPath}/login`;
}
