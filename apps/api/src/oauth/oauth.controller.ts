import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

/**
 * Groundwork for OAuth 2.0 / OpenID Connect: providers will be wired to `OAuthAccount` (Prisma).
 * No authorization flows are implemented yet.
 */
@ApiTags("oauth")
@Controller("oauth")
export class OAuthController {
  @Get("providers")
  @ApiOperation({ summary: "Planned OAuth providers (stub)" })
  providers() {
    return {
      message: "OAuth flows not enabled yet. Use email/password auth.",
      plannedProviders: ["google", "apple"],
    };
  }
}
