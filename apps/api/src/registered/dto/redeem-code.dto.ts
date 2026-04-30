import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class RedeemCodeDto {
  @ApiProperty({ example: "WELCOME250" })
  @IsString()
  @MinLength(3)
  code!: string;
}
