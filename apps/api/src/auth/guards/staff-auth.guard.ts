import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Injectable()
export class StaffAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.header("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      return super.canActivate(context);
    }

    if (process.env.NODE_ENV === "development") {
      const expected = this.config.get<string>("KITCHEN_DEV_TOKEN");
      const token = request.header("x-kitchen-dev-token");

      if (expected && token === expected) {
        request.user = {
          id: "dev-user",
          tenantId: "dev-tenant",
          role: "manager",
          storeIds: [],
        };
        return true;
      }
    }

    throw new UnauthorizedException("Authentication required");
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException("Authentication required");
    }

    return user;
  }
}
