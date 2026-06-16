import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {
  JwtAuthGuard,
  RolesGuard,
  TenantGuard,
} from "./guards/auth.guards";
import { StaffAuthGuard } from "./guards/staff-auth.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: "15m" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
    StaffAuthGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
    StaffAuthGuard,
  ],
})
export class AuthModule {}
