import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import type { Request } from "express";
import { ROLES_KEY } from "../roles.decorator";

export type AuthedRequestUser = {
  userId: number;
  email: string;
  role: UserRole;
};

/**
 * Requires `req.user` (set by JwtAuthMiddleware or JwtAuthGuard) and checks `UserRole`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request & { user?: AuthedRequestUser }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException("Missing authenticated user");
    }
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient role");
    }
    return true;
  }
}
