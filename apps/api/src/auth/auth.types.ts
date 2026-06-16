import type { StaffRole } from "@mizline/shared";

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: StaffRole;
  storeIds: string[];
}

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  role: StaffRole;
  storeIds: string[];
}
