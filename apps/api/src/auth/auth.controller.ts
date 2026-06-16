import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { AuthUser, LoginResponse } from "@mizline/shared";
import type { Request, Response } from "express";
import { AuthService, REFRESH_COOKIE } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/auth.guards";
import type { AuthenticatedUser } from "./auth.types";

function refreshCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse & { refreshToken: string }> {
    const result = await this.authService.login(dto);
    const secure = req.protocol === "https";

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions(secure));

    return {
      accessToken: result.accessToken,
      user: result.user,
      refreshToken: result.refreshToken,
    };
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse & { refreshToken: string }> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const result = await this.authService.refresh(refreshToken);
    const secure = req.protocol === "https";

    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions(secure));

    return {
      accessToken: result.accessToken,
      user: result.user,
      refreshToken: result.refreshToken,
    };
  }

  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    return this.authService.getMe(user.id);
  }
}
