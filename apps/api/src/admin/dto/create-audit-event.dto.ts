import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuditCategory, AuditLevel, AuditResult, AuditWorkspace } from "@prisma/client";
import { IsArray, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateAuditEventDto {
  @ApiPropertyOptional({ enum: AuditWorkspace, default: AuditWorkspace.MANAGER })
  @IsOptional()
  @IsEnum(AuditWorkspace)
  workspace?: AuditWorkspace;

  @ApiProperty({ enum: AuditCategory })
  @IsEnum(AuditCategory)
  category!: AuditCategory;

  @ApiPropertyOptional({ enum: AuditLevel, default: AuditLevel.INFO })
  @IsOptional()
  @IsEnum(AuditLevel)
  level?: AuditLevel;

  @ApiProperty({ maxLength: 180 })
  @IsString()
  @MaxLength(180)
  action!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetUuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: AuditResult, default: AuditResult.SUCCESS })
  @IsOptional()
  @IsEnum(AuditResult)
  result?: AuditResult;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkLabel?: string;
}

