import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBackupDto {
  @ApiPropertyOptional({ example: "Before import April 26" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiPropertyOptional({ enum: ["CURRENT", "SEED", "MANUAL"], default: "MANUAL" })
  @IsOptional()
  @IsIn(["CURRENT", "SEED", "MANUAL"])
  kind?: "CURRENT" | "SEED" | "MANUAL";
}

