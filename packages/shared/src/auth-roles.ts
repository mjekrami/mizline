import type { StaffRole } from "./types";

const ROLE_RANK: Record<StaffRole, number> = {
  barista: 1,
  manager: 2,
  tenant_admin: 3,
  super_admin: 4,
};

export function hasMinimumRole(
  userRole: StaffRole,
  requiredRole: StaffRole,
): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}

export function canAccessAdmin(role: StaffRole): boolean {
  return hasMinimumRole(role, "manager");
}

export function canAccessKitchen(role: StaffRole): boolean {
  return hasMinimumRole(role, "barista");
}
