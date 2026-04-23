import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UpdateFavoriteCategoriesDto } from "./dto/update-favorite-categories.dto";
import { RegisteredService } from "./registered.service";

/**
 * TWA client–only API surface (same audience as Home / Map / History / Profile).
 * `JwtAuthMiddleware` + **CLIENT** role only.
 */
@ApiTags("registered")
@ApiBearerAuth("access-token")
@Controller("registered")
@UseGuards(RolesGuard)
@Roles(UserRole.CLIENT)
export class RegisteredController {
  constructor(private readonly registeredService: RegisteredService) {}

  @Get("profile")
  @ApiOperation({ summary: "Example route for any logged-in user" })
  profile(@CurrentUser() user: RequestUser) {
    return {
      scope: "registered",
      user,
    };
  }

  @Get("categories")
  @ApiOperation({
    summary: "List available categories with favorite flag for current user",
  })
  categories(@CurrentUser() user: RequestUser) {
    return this.registeredService.listCategories(user.userId);
  }

  @Get("favorite-categories")
  @ApiOperation({ summary: "Get favorite categories (slug list) for current user" })
  favoriteCategories(@CurrentUser() user: RequestUser) {
    return this.registeredService.listFavoriteCategorySlugs(user.userId);
  }

  @Put("favorite-categories")
  @ApiBody({ type: UpdateFavoriteCategoriesDto })
  @ApiOperation({ summary: "Replace favorite categories for current user" })
  setFavoriteCategories(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFavoriteCategoriesDto,
  ) {
    return this.registeredService.replaceFavoriteCategories(user.userId, dto.categorySlugs);
  }
}
