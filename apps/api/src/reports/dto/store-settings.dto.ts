import { IsInt, Min } from "class-validator";

export class UpdateStoreSettingsDto {
  @IsInt()
  @Min(1)
  delayWarningMinutes!: number;

  @IsInt()
  @Min(2)
  delayCriticalMinutes!: number;
}
