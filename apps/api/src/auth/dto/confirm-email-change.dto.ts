import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ConfirmEmailChangeDto {
  @ApiProperty({ description: "Raw email-change token from confirmation link" })
  @IsString()
  @MinLength(20)
  token!: string;
}
