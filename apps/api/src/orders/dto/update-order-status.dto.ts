import { IsIn } from "class-validator";
import type { OrderStatus } from "@mizline/shared";

const KITCHEN_STATUSES = [
  "preparing",
  "ready",
  "fulfilled",
] as const satisfies readonly OrderStatus[];

export class UpdateOrderStatusDto {
  @IsIn(KITCHEN_STATUSES)
  status!: (typeof KITCHEN_STATUSES)[number];
}
