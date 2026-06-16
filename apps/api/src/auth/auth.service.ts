import { createHash, randomBytes } from "node:crypto";
import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { AuthUser, LoginResponse } from "@mizline/shared";
import { StaffRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "./auth.types";
import { LoginDto } from "./dto/login.dto";

const REFRESH_COOKIE = "mizline_refresh";
const REFRESH_DAYS = 7;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toSharedRole(role: StaffRole): AuthUser["role"] {
  return role as AuthUser["role"];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  getRefreshCookieName(): string {
    return REFRESH_COOKIE;
  }

  async login(dto: LoginDto): Promise<LoginResponse & { refreshToken: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        active: true,
      },
      include: { storeLinks: { select: { storeId: true } } },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const storeIds = user.storeLinks.map((link) => link.storeId);
    const authUser = this.mapAuthUser(user, storeIds);
    const accessToken = this.signAccessToken(user.id, user.tenantId, user.role, storeIds);
    const refreshToken = await this.issueRefreshToken(user.id);

    return { accessToken, user: authUser, refreshToken };
  }

  async refresh(refreshToken: string): Promise<LoginResponse & { refreshToken: string }> {
    const tokenHash = hashToken(refreshToken);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { storeLinks: { select: { storeId: true } } },
        },
      },
    });

    if (!existing || existing.expiresAt < new Date() || !existing.user.active) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const storeIds = existing.user.storeLinks.map((link) => link.storeId);
    const accessToken = this.signAccessToken(
      existing.user.id,
      existing.user.tenantId,
      existing.user.role,
      storeIds,
    );

    return {
      accessToken,
      user: this.mapAuthUser(existing.user, storeIds),
      refreshToken,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;

    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, active: true },
      include: { storeLinks: { select: { storeId: true } } },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.mapAuthUser(user, user.storeLinks.map((link) => link.storeId));
  }

  private signAccessToken(
    userId: string,
    tenantId: string,
    role: StaffRole,
    storeIds: string[],
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      tenantId,
      role: toSharedRole(role),
      storeIds,
    };

    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>("JWT_SECRET"),
      expiresIn: "15m",
    });
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return token;
  }

  private mapAuthUser(
    user: {
      id: string;
      tenantId: string;
      email: string;
      name: string;
      role: StaffRole;
    },
    storeIds: string[],
  ): AuthUser {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: toSharedRole(user.role),
      storeIds,
    };
  }
}

export { REFRESH_COOKIE };
