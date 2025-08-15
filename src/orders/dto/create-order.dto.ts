import { IsArray, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  tableId: string;

  @IsArray()
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}
