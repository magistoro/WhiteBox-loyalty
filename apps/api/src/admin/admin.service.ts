import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountStatus, Prisma, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateCompanySubscriptionDto } from "./dto/create-company-subscription.dto";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateCompanySubscriptionDto } from "./dto/update-company-subscription.dto";
import { UpdateCompanyUserDto } from "./dto/update-company-user.dto";
import { UpsertCompanyProfileDto } from "./dto/upsert-company-profile.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  private async requireCompanyUser(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: { managedCompany: true },
    });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new NotFoundException("Company user not found");
    }
    return user;
  }

  async createAccount(dto: CreateAccountDto) {
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
        role: dto.role,
        passwordHash,
      },
      select: {
        uuid: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }

  async listUsers(role?: UserRole, query?: string) {
    const q = query?.trim().toLowerCase();
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { uuid: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        uuid: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
      take: 200,
    });
  }

  async updateUserRole(uuid: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.prisma.user.update({
      where: { uuid },
      data: { role },
      select: {
        uuid: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async getUserByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        telegramId: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        emailVerifiedAt: true,
        deletionScheduledAt: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true,
        favoriteCategories: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            category: {
              select: { id: true, slug: true, name: true, icon: true },
            },
          },
        },
        companyLinks: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            balance: true,
            pointsToNextReward: true,
            expiringPoints: true,
            expiringDate: true,
            createdAt: true,
            updatedAt: true,
            company: {
              select: {
                slug: true,
                name: true,
                category: { select: { slug: true, name: true } },
              },
            },
          },
        },
        subscriptions: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            status: true,
            activatedAt: true,
            expiresAt: true,
            willAutoRenew: true,
            createdAt: true,
            updatedAt: true,
            subscription: {
              select: {
                uuid: true,
                slug: true,
                name: true,
                price: true,
                renewalPeriod: true,
                company: { select: { name: true } },
                category: { select: { name: true } },
              },
            },
          },
        },
        refreshTokens: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            expiresAt: true,
            createdAt: true,
            revokedAt: true,
          },
        },
        oauthAccounts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            scope: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        loginEvents: {
          orderBy: { createdAt: "desc" },
          take: 25,
          select: {
            id: true,
            ipAddress: true,
            countryCode: true,
            city: true,
            userAgent: true,
            deviceLabel: true,
            createdAt: true,
          },
        },
        loyaltyTransactions: {
          orderBy: { occurredAt: "desc" },
          take: 50,
          select: {
            uuid: true,
            type: true,
            status: true,
            amount: true,
            description: true,
            occurredAt: true,
            company: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const countryFrequency = new Map<string, number>();
    for (const event of user.loginEvents) {
      const key = (event.countryCode ?? "unknown").toUpperCase();
      countryFrequency.set(key, (countryFrequency.get(key) ?? 0) + 1);
    }
    const primaryCountry =
      [...countryFrequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const latestCountry =
      (user.loginEvents[0]?.countryCode ?? null)?.toUpperCase() ?? null;
    const unusualCountries = [...countryFrequency.keys()].filter(
      (c) => primaryCountry && c !== primaryCountry && c !== "UNKNOWN",
    );

    return {
      ...user,
      telegramId: user.telegramId?.toString() ?? null,
      hasPassword: Boolean(user.passwordHash),
      passwordHash: undefined,
      loginRisk: {
        primaryCountry,
        latestCountry,
        unusualCountries,
        shouldReview:
          Boolean(primaryCountry && latestCountry && latestCountry !== primaryCountry) ||
          unusualCountries.length > 0,
      },
    };
  }

  async updateUserByUuid(uuid: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { uuid } });
    if (!existing) {
      throw new NotFoundException("User not found");
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }
    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }
    if (dto.accountStatus !== undefined) {
      updateData.accountStatus = dto.accountStatus;
    }
    if (dto.emailVerifiedAt !== undefined) {
      updateData.emailVerifiedAt =
        dto.emailVerifiedAt === null || dto.emailVerifiedAt === ""
          ? null
          : new Date(dto.emailVerifiedAt);
    }
    if (dto.createdAt !== undefined && dto.createdAt !== null && dto.createdAt !== "") {
      updateData.createdAt = new Date(dto.createdAt);
    }

    try {
      await this.prisma.user.update({
        where: { uuid },
        data: updateData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("A user with this email or telegram id already exists");
      }
      throw error;
    }

    return this.getUserByUuid(uuid);
  }

  async reactivateUserAccountByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.prisma.user.update({
      where: { uuid },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        deletionScheduledAt: null,
      },
      select: {
        uuid: true,
        accountStatus: true,
        deletionScheduledAt: true,
        updatedAt: true,
      },
    });
  }

  async requestEmailChange(uuid: string, actorUserId: number, newEmailRaw: string) {
    const target = await this.prisma.user.findUnique({ where: { uuid } });
    if (!target) {
      throw new NotFoundException("User not found");
    }

    const newEmail = newEmailRaw.trim().toLowerCase();
    if (!newEmail) {
      throw new BadRequestException("New email is required");
    }
    if (newEmail === target.email) {
      throw new BadRequestException("New email must be different from current email");
    }

    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      throw new ConflictException("This email is already in use");
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresInHours = Number(this.config.get("EMAIL_CHANGE_TOKEN_HOURS") ?? 24);
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.emailChangeRequest.updateMany({
        where: { userId: target.id, usedAt: null, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.emailChangeRequest.create({
        data: {
          tokenHash,
          userId: target.id,
          requestedByUserId: actorUserId,
          oldEmail: target.email,
          newEmail,
          expiresAt,
        },
      }),
    ]);

    const frontendOrigin = this.config.get("FRONTEND_ORIGIN") ?? "http://localhost:3000";
    const confirmUrl = `${frontendOrigin}/email-change/confirm?token=${rawToken}`;

    // Placeholder transport: integrate with real SMTP/provider webhook when available.
    // We still return success and (in non-production) preview URL for manual verification.
    if (process.env.NODE_ENV !== "test") {
      console.info(`[email-change] send to ${newEmail}: ${confirmUrl}`);
    }

    return {
      success: true as const,
      sentTo: newEmail,
      expiresAt: expiresAt.toISOString(),
      ...(process.env.NODE_ENV === "production" ? {} : { previewUrl: confirmUrl }),
    };
  }

  async deleteUserByUuid(uuid: string, actorUserId: number) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.id === actorUserId) {
      throw new BadRequestException("You cannot delete your own admin account.");
    }

    await this.prisma.user.delete({ where: { uuid } });
    return { success: true as const };
  }

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = this.slugify(dto.slug || dto.name);
    return this.prisma.category.create({
      data: {
        slug,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        icon: dto.icon.trim(),
      },
    });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found");
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined ? { slug: this.slugify(dto.slug) } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon.trim() } : {}),
      },
    });
  }

  async deleteCategory(id: number) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found");
    const companyRefs = await this.prisma.company.count({ where: { categoryId: id } });
    if (companyRefs > 0) {
      throw new BadRequestException("Cannot delete category linked to companies.");
    }
    await this.prisma.category.delete({ where: { id } });
    return { success: true as const };
  }

  async listCompanyUsers(query?: string) {
    const q = query?.trim();
    return this.prisma.user.findMany({
      where: {
        role: UserRole.COMPANY,
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name: { contains: q, mode: "insensitive" } },
                { uuid: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        managedCompany: {
          select: {
            id: true,
            slug: true,
            name: true,
            isActive: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  async getCompanyUserByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        managedCompany: {
          include: {
            category: true,
            subscriptions: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new NotFoundException("Company user not found");
    }
    return user;
  }

  async updateCompanyUserByUuid(uuid: string, dto: UpdateCompanyUserDto) {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new NotFoundException("Company user not found");
    }
    return this.prisma.user.update({
      where: { uuid },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.accountStatus !== undefined ? { accountStatus: dto.accountStatus } : {}),
        ...(dto.emailVerifiedAt !== undefined
          ? {
              emailVerifiedAt:
                dto.emailVerifiedAt === null || dto.emailVerifiedAt === ""
                  ? null
                  : new Date(dto.emailVerifiedAt),
            }
          : {}),
        ...(dto.createdAt !== undefined && dto.createdAt !== null && dto.createdAt !== ""
          ? { createdAt: new Date(dto.createdAt) }
          : {}),
      },
      include: { managedCompany: true },
    });
  }

  async deleteCompanyUserByUuid(uuid: string, actorUserId: number) {
    const user = await this.prisma.user.findUnique({ where: { uuid }, include: { managedCompany: true } });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new NotFoundException("Company user not found");
    }
    if (user.id === actorUserId) {
      throw new BadRequestException("You cannot delete your own account.");
    }
    if (user.managedCompany) {
      const subCount = await this.prisma.subscription.count({ where: { companyId: user.managedCompany.id } });
      if (subCount > 0) {
        throw new BadRequestException("Delete company subscriptions first.");
      }
      await this.prisma.company.delete({ where: { id: user.managedCompany.id } });
    }
    await this.prisma.user.delete({ where: { uuid } });
    return { success: true as const };
  }

  async upsertCompanyProfile(uuid: string, dto: UpsertCompanyProfileDto) {
    const user = await this.requireCompanyUser(uuid);
    const slugBase = dto.slug || dto.name;
    const slug = this.slugify(slugBase);
    if (!slug) throw new BadRequestException("Company slug is invalid.");
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException("Category not found");

    if (user.managedCompany) {
      return this.prisma.company.update({
        where: { id: user.managedCompany.id },
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
          categoryId: dto.categoryId,
          pointsPerReward: dto.pointsPerReward ?? 100,
          isActive: dto.isActive ?? true,
        },
      });
    }

    return this.prisma.company.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        categoryId: dto.categoryId,
        pointsPerReward: dto.pointsPerReward ?? 100,
        isActive: dto.isActive ?? true,
        ownerUserId: user.id,
      },
    });
  }

  async listCompanySubscriptions(companyUserUuid: string) {
    const user = await this.requireCompanyUser(companyUserUuid);
    if (!user.managedCompany) {
      return [];
    }
    return this.prisma.subscription.findMany({
      where: { companyId: user.managedCompany.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async createCompanySubscription(companyUserUuid: string, dto: CreateCompanySubscriptionDto) {
    const user = await this.requireCompanyUser(companyUserUuid);
    if (!user.managedCompany) {
      throw new BadRequestException("Company profile must exist before creating subscriptions.");
    }
    const slug = this.slugify(dto.slug || dto.name);
    if (!slug) throw new BadRequestException("Subscription slug is invalid.");

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException("Category not found");
    }

    return this.prisma.subscription.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description.trim(),
        price: new Prisma.Decimal(dto.price),
        renewalPeriod: dto.renewalPeriod.trim(),
        companyId: user.managedCompany.id,
        categoryId: dto.categoryId ?? user.managedCompany.categoryId,
      },
      include: { category: true, company: true },
    });
  }

  async updateCompanySubscription(
    companyUserUuid: string,
    subscriptionUuid: string,
    dto: UpdateCompanySubscriptionDto,
  ) {
    const user = await this.requireCompanyUser(companyUserUuid);
    if (!user.managedCompany) {
      throw new BadRequestException("Company profile must exist before managing subscriptions.");
    }
    const sub = await this.prisma.subscription.findUnique({
      where: { uuid: subscriptionUuid },
    });
    if (!sub || sub.companyId !== user.managedCompany.id) {
      throw new NotFoundException("Subscription not found for this company user.");
    }
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException("Category not found");
    }
    return this.prisma.subscription.update({
      where: { uuid: subscriptionUuid },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.slug !== undefined ? { slug: this.slugify(dto.slug) } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.price !== undefined ? { price: new Prisma.Decimal(dto.price) } : {}),
        ...(dto.renewalPeriod !== undefined ? { renewalPeriod: dto.renewalPeriod.trim() } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        companyId: user.managedCompany.id,
      },
      include: { category: true, company: true },
    });
  }

  async deleteCompanySubscription(companyUserUuid: string, subscriptionUuid: string) {
    const user = await this.requireCompanyUser(companyUserUuid);
    if (!user.managedCompany) {
      throw new BadRequestException("Company profile must exist before managing subscriptions.");
    }
    const sub = await this.prisma.subscription.findUnique({
      where: { uuid: subscriptionUuid },
    });
    if (!sub || sub.companyId !== user.managedCompany.id) {
      throw new NotFoundException("Subscription not found for this company user.");
    }
    await this.prisma.subscription.delete({ where: { uuid: subscriptionUuid } });
    return { success: true as const };
  }

  async subscriptionStats() {
    const [total, active, expired, canceled] = await Promise.all([
      this.prisma.userSubscription.count(),
      this.prisma.userSubscription.count({ where: { status: "ACTIVE" } }),
      this.prisma.userSubscription.count({ where: { status: "EXPIRED" } }),
      this.prisma.userSubscription.count({ where: { status: "CANCELED" } }),
    ]);
    return { total, active, expired, canceled };
  }

  async findSubscriptionByUuid(uuid: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { uuid },
      include: {
        company: { select: { id: true, slug: true, name: true } },
        category: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!sub) {
      throw new NotFoundException("Subscription not found");
    }
    return sub;
  }
}
