import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ example: "coffee" })
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty({ example: "Coffee" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: "Coffee shops and cafes" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "Coffee" })
  @IsString()
  @MinLength(2)
  icon!: string;
}
