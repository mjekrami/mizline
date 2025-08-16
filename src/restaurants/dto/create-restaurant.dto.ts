import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsUUID()
  adminId: string;
}
