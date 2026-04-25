import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class RestoreBackupDto {
  @ApiProperty({
    description: "Safety confirmation flag for destructive restore operation",
    example: true,
  })
  @IsBoolean()
  confirm!: boolean;
}

