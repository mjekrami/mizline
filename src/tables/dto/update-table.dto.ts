import { IsInt, IsOptional } from 'class-validator';

export class UpdateTableDto {
  @IsInt()
  @IsOptional()
  number?: number;

  @IsInt()
  @IsOptional()
  capacity?: number;
}
