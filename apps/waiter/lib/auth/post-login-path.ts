import type { AuthUser } from "@mizline/shared";
import { canAccessWaiter } from "@mizline/shared";
import { staffHref, staffLoginHref } from "@/lib/waiter-path";

export function resolvePostLoginPath(
  user: AuthUser,
  staffPath: string,
  next?: string,
): string {
  if (next?.startsWith(`/${staffPath}`) && canAccessWaiter(user.role)) {
    return next;
  }

  if (canAccessWaiter(user.role)) {
    return staffHref(staffPath);
  }

  return staffLoginHref(staffPath);
}

export function canAccessWaiterPath(role: AuthUser["role"], path: string): boolean {
  if (path.includes("/login")) {
    return true;
  }

  return canAccessWaiter(role);
}
