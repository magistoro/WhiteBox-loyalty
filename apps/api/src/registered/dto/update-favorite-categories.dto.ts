import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";

export class UpdateFavoriteCategoriesDto {
  @ApiProperty({
    type: [String],
    example: ["coffee", "fitness", "food"],
    description: "Category slugs in priority order",
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  categorySlugs!: string[];
}
