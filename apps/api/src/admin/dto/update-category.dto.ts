import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: "coffee" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiPropertyOptional({ example: "Coffee" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: "Coffee shops and cafes" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "Coffee" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  icon?: string;
}
