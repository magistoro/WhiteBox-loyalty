import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class UpdateReferralCampaignDto {
  @ApiPropertyOptional({ example: "Invite a friend" })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsInt()
  @Min(0)
  inviterBonusPoints?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsInt()
  @Min(0)
  invitedBonusPoints?: number;

  @ApiPropertyOptional({ example: "company-user-uuid" })
  @IsOptional()
  @IsString()
  bonusCompanyUuid?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
