import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { StaffRole } from "@prisma/client";

export class CreateStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(StaffRole)
  role!: StaffRole;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  storeIds?: string[];

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class AssignOrderDto {
  @IsString()
  userId!: string;
}
