import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";

/** Mirrors Prisma `AccountStatus` — string union keeps emitted `.d.ts` stable if Prisma re-exports differ. */
export type AccountStatusValue = "ACTIVE" | "FROZEN_PENDING_DELETION";

export type SafeUser = {
  id: string;
  legacyId: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  accountStatus: AccountStatusValue;
  deletionScheduledAt: string | null;
};

export type LoginContext = {
  ipAddress?: string | null;
  countryCode?: string | null;
  city?: string | null;
  userAgent?: string | null;
  deviceLabel?: string | null;
  requestId?: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const role = dto.role ?? UserRole.CLIENT;
    if (role === UserRole.ADMIN) {
      throw new BadRequestException(
        "Administrator accounts cannot be created via public registration",
      );
    }
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        role,
      },
    });
    return this.issueTokens(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user) return null;

    const now = new Date();
    if (
      user.accountStatus === "FROZEN_PENDING_DELETION" &&
      user.deletionScheduledAt &&
      user.deletionScheduledAt <= now
    ) {
      await this.prisma.user.delete({ where: { id: user.id } });
      return null;
    }

    if (!user.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new BadRequestException("Password login is not set for this account.");
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Current password is incorrect.");
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true as const };
  }

  /** Soft-delete window: account stays recoverable for 5 days. */
  async freezeAccount(userId: number) {
    const deletionScheduledAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "FROZEN_PENDING_DELETION",
        deletionScheduledAt,
      },
    });
    return {
      user: this.toSafeUser(user),
      deletionScheduledAt: user.deletionScheduledAt!.toISOString(),
    };
  }

  async reactivateAccount(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("User not found.");
    }
    if (user.accountStatus !== "FROZEN_PENDING_DELETION") {
      throw new BadRequestException("Account is not scheduled for deletion.");
    }
    const now = new Date();
    if (user.deletionScheduledAt && user.deletionScheduledAt <= now) {
      await this.prisma.user.delete({ where: { id: userId } });
      throw new BadRequestException(
        "Recovery period has ended. This account has been permanently removed.",
      );
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
        deletionScheduledAt: null,
      },
    });
    return this.issueTokens(updated);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return this.issueTokens(user);
  }

  async recordLoginEvent(userId: number, ctx: LoginContext) {
    await this.prisma.loginEvent.create({
      data: {
        userId,
        ipAddress: ctx.ipAddress ?? null,
        countryCode: ctx.countryCode?.toUpperCase() ?? null,
        city: ctx.city ?? null,
        userAgent: ctx.userAgent ?? null,
        deviceLabel: ctx.deviceLabel ?? null,
        requestId: ctx.requestId ?? null,
      },
    });
  }

  async refresh(dto: RefreshDto) {
    const tokenHash = createHash("sha256").update(dto.refreshToken).digest("hex");
    const row = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    if (!row?.user) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(row.user);
  }

  async issueTokens(user: User) {
    const expiresIn = this.config.get<string>("JWT_EXPIRES_IN") ?? "15m";
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshRaw = randomBytes(48).toString("hex");
    const refreshHash = createHash("sha256").update(refreshRaw).digest("hex");
    const days = Number(this.config.get("JWT_REFRESH_EXPIRES_DAYS") ?? 7);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshHash,
        userId: user.id,
        expiresAt,
      },
    });

    const favoriteCount = await this.prisma.userFavoriteCategory.count({
      where: { userId: user.id },
    });

    return {
      accessToken,
      refreshToken: refreshRaw,
      tokenType: "Bearer" as const,
      expiresIn,
      needsCategoryOnboarding: favoriteCount === 0,
      user: this.toSafeUser(user),
    };
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.uuid,
      legacyId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      accountStatus: user.accountStatus as AccountStatusValue,
      deletionScheduledAt: user.deletionScheduledAt?.toISOString() ?? null,
    };
  }

  async findSafeUserById(id: number): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const now = new Date();
    if (
      user.accountStatus === "FROZEN_PENDING_DELETION" &&
      user.deletionScheduledAt &&
      user.deletionScheduledAt <= now
    ) {
      await this.prisma.user.delete({ where: { id: user.id } });
      return null;
    }
    return this.toSafeUser(user);
  }

  async confirmEmailChange(rawToken: string) {
    const token = rawToken.trim();
    if (!token) {
      throw new BadRequestException("Token is required.");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const request = await this.prisma.emailChangeRequest.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!request || request.usedAt || request.revokedAt || request.expiresAt <= new Date()) {
      throw new BadRequestException("Invalid or expired email change token.");
    }

    const emailTaken = await this.prisma.user.findUnique({
      where: { email: request.newEmail },
      select: { id: true },
    });
    if (emailTaken && emailTaken.id !== request.userId) {
      throw new ConflictException("Target email is already in use.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: request.userId },
        data: {
          email: request.newEmail,
          emailVerifiedAt: new Date(),
        },
      }),
      this.prisma.emailChangeRequest.update({
        where: { id: request.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.emailChangeRequest.updateMany({
        where: { userId: request.userId, usedAt: null, revokedAt: null, id: { not: request.id } },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      success: true as const,
      email: request.newEmail,
      message: "Email updated successfully. Please login with your new email.",
    };
  }
}
