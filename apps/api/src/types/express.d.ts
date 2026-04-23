import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      /** Set by JwtAuthMiddleware or Passport JWT strategy */
      user?: {
        userId: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
