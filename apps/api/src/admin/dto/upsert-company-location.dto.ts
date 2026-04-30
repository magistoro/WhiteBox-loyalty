import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength } from "class-validator";

export class UpsertCompanyLocationDto {
  @ApiPropertyOptional({ example: "Main entrance" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: "Moscow, Tverskaya street, 7" })
  @IsString()
  @MinLength(5)
  address!: string;

  @ApiPropertyOptional({ example: "Moscow" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "09:00" })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  openTime?: string;

  @ApiPropertyOptional({ example: "21:00" })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closeTime?: string;

  @ApiPropertyOptional({ example: [1, 2, 3, 4, 5], description: "0 is Sunday, 1 is Monday." })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  workingDays?: number[];
}
