import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class KitchenDevTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>("KITCHEN_DEV_TOKEN");
    if (!expected) {
      throw new UnauthorizedException("Kitchen dev token is not configured");
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.header("x-kitchen-dev-token");

    if (!token || token !== expected) {
      throw new UnauthorizedException("Invalid kitchen dev token");
    }

    return true;
  }
}
