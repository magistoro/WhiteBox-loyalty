import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCompanySubscriptionDto {
  @ApiProperty({ example: "Monthly Unlimited" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: "Unlimited access to all classes" })
  @IsString()
  @MinLength(5)
  description!: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: "month", description: "Legacy combined period label" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  renewalPeriod?: string;

  @ApiPropertyOptional({ example: 1, description: "Base renewal length value (e.g. 3 months => 3)" })
  @IsOptional()
  @IsInt()
  @Min(1)
  renewalValue?: number;

  @ApiPropertyOptional({ example: "month", enum: ["week", "month", "year"] })
  @IsOptional()
  @IsString()
  @IsIn(["week", "month", "year"])
  renewalUnit?: "week" | "month" | "year";

  @ApiPropertyOptional({ example: 10, description: "Promo bonus days added while promo is active" })
  @IsOptional()
  @IsInt()
  @Min(0)
  promoBonusDays?: number;

  @ApiPropertyOptional({ example: "2026-05-01T23:59:59.000Z" })
  @IsOptional()
  @IsString()
  promoEndsAt?: string;

  @ApiPropertyOptional({ example: "monthly-unlimited" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;
}
