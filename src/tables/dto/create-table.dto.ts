import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @IsNotEmpty()
  number: number;

  @IsInt()
  @IsNotEmpty()
  capacity: number;

  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;
}
