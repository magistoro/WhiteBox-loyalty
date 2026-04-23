import { ApiPropertyOptional } from "@nestjs/swagger";
import { AccountStatus, UserRole } from "@prisma/client";
import { IsEnum, IsISO8601, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Jane Doe" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.CLIENT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;

  @ApiPropertyOptional({
    nullable: true,
    description: "ISO date-time string or null",
    example: "2026-04-23T12:00:00.000Z",
  })
  @IsOptional()
  @IsISO8601()
  emailVerifiedAt?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: "ISO date-time string or null",
    example: "2026-01-01T08:00:00.000Z",
  })
  @IsOptional()
  @IsISO8601()
  createdAt?: string | null;

}
