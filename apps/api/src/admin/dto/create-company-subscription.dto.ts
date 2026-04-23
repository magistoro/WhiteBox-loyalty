import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

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

  @ApiProperty({ example: "month" })
  @IsString()
  @MinLength(2)
  renewalPeriod!: string;

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
