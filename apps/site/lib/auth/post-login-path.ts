import type { AuthUser } from "@mizline/shared";
import { canAccessAdmin, canAccessKitchen, canAccessWaiter } from "@mizline/shared";

export function resolvePostLoginPath(
  user: AuthUser,
  staffPath: string,
  next?: string,
): string {
  if (next?.startsWith(`/${staffPath}/`) && canAccessStaffPath(user.role, next)) {
    return next;
  }

  if (canAccessAdmin(user.role)) {
    return `/${staffPath}/admin`;
  }

  if (canAccessKitchen(user.role)) {
    return `/${staffPath}/kitchen`;
  }

  if (canAccessWaiter(user.role)) {
    return `/${staffPath}/waiter`;
  }

  return `/${staffPath}/login`;
}

export function canAccessStaffPath(role: AuthUser["role"], path: string): boolean {
  if (path.includes("/admin")) {
    return canAccessAdmin(role);
  }

  if (path.includes("/kitchen")) {
    return canAccessKitchen(role);
  }

  if (path.includes("/waiter")) {
    return canAccessWaiter(role);
  }

  return true;
}
