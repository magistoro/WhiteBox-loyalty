import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreatePromoCodeDto {
  @ApiProperty({ example: "WELCOME250" })
  @IsString()
  @MinLength(3)
  code!: string;

  @ApiProperty({ example: "Welcome bonus" })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiPropertyOptional({ example: "Gives new users 250 bonus points" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ["POINTS", "SUBSCRIPTION"] })
  @IsIn(["POINTS", "SUBSCRIPTION"])
  rewardType!: "POINTS" | "SUBSCRIPTION";

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ example: "company-user-uuid" })
  @IsOptional()
  @IsString()
  companyUuid?: string;

  @ApiPropertyOptional({ example: "subscription-uuid" })
  @IsOptional()
  @IsString()
  subscriptionUuid?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
