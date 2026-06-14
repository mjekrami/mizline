import { IsOptional, IsString } from "class-validator";

export class ListStoreOrdersQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
