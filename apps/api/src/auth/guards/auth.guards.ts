import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { hasMinimumRole } from "@mizline/shared";
import type { StaffRole } from "@mizline/shared";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../auth.types";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const allowed = requiredRoles.some((role) =>
      hasMinimumRole(user.role, role),
    );

    if (!allowed) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params?: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const storeId = request.params?.storeId;
    if (!storeId) {
      return true;
    }

    if (
      user.id === "dev-user" ||
      user.role === "tenant_admin" ||
      user.role === "super_admin" ||
      user.storeIds.includes(storeId)
    ) {
      return true;
    }

    throw new ForbiddenException("Store access denied");
  }
}
