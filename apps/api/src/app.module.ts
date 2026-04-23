import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { AdminController } from "./admin/admin.controller";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthMiddleware } from "./auth/middleware/jwt-auth.middleware";
import { HealthModule } from "./health/health.module";
import { OAuthModule } from "./oauth/oauth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RegisteredController } from "./registered/registered.controller";
import { RegisteredModule } from "./registered/registered.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, "..", "..", "..", ".env"),
        join(__dirname, "..", "..", ".env"),
        ".env",
      ],
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    RegisteredModule,
    OAuthModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtAuthMiddleware).forRoutes(AdminController, RegisteredController);
  }
}
