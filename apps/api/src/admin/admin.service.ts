import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountStatus, Prisma, SubscriptionSpendPolicy, UserRole } from "@prisma/client";
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
  private static readonly MAX_SLUG_LENGTH = 60;
  private static readonly RENEWAL_UNITS = ["week", "month", "year"] as const;

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
      .slice(0, AdminService.MAX_SLUG_LENGTH);
  }

  private async createUniqueSlug(
    baseValue: string,
    exists: (slug: string) => Promise<{ id: number } | null>,
    fallback: string,
    excludeId?: number,
  ) {
    const normalizedBase = (this.slugify(baseValue) || fallback).slice(
      0,
      AdminService.MAX_SLUG_LENGTH,
    );
    let candidate = normalizedBase;
    let suffixIndex = 2;

    while (true) {
      const existing = await exists(candidate);
      if (!existing || (excludeId !== undefined && existing.id === excludeId)) {
        return candidate;
      }

      const suffix = `-${suffixIndex}`;
      const head = normalizedBase.slice(
        0,
        Math.max(1, AdminService.MAX_SLUG_LENGTH - suffix.length),
      );
      candidate = `${head}${suffix}`;
      suffixIndex += 1;
    }
  }

  private async createUniqueCategorySlug(baseValue: string, excludeId?: number) {
    return this.createUniqueSlug(
      baseValue,
      (slug) => this.prisma.category.findUnique({ where: { slug }, select: { id: true } }),
      "category",
      excludeId,
    );
  }

  private async createUniqueCompanySlug(baseValue: string, excludeId?: number) {
    return this.createUniqueSlug(
      baseValue,
      (slug) => this.prisma.company.findUnique({ where: { slug }, select: { id: true } }),
      "company",
      excludeId,
    );
  }

  private async createUniqueSubscriptionSlug(baseValue: string, excludeId?: number) {
    return this.createUniqueSlug(
      baseValue,
      (slug) => this.prisma.subscription.findUnique({ where: { slug }, select: { id: true } }),
      "subscription",
      excludeId,
    );
  }

  private async requireCompanyUser(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: { managedCompany: { include: { categories: true, levelRules: true } } },
    });
    if (!user || user.role !== UserRole.COMPANY) {
      throw new NotFoundException("Company user not found");
    }
    return user;
  }

  private parseRenewalUnit(raw?: string | null): (typeof AdminService.RENEWAL_UNITS)[number] {
    const unit = (raw ?? "").trim().toLowerCase();
    if (AdminService.RENEWAL_UNITS.includes(unit as never)) {
      return unit as (typeof AdminService.RENEWAL_UNITS)[number];
    }
    throw new BadRequestException("Renewal unit must be week, month or year.");
  }

  private buildRenewalLabel(
    value: number,
    unit: (typeof AdminService.RENEWAL_UNITS)[number],
    promoBonusDays: number,
  ) {
    const base = `${value} ${unit}${value > 1 ? "s" : ""}`;
    if (promoBonusDays > 0) {
      return `${base} (+${promoBonusDays} bonus days promo)`;
    }
    return base;
  }

  private normalizeCompanyCategoryIds(dto: UpsertCompanyProfileDto) {
    const fromArray = (dto.categoryIds ?? [])
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    const merged = dto.categoryId ? [dto.categoryId, ...fromArray] : fromArray;
    const uniqueOrdered = [...new Set(merged)];
    if (uniqueOrdered.length === 0) {
      throw new BadRequestException("At least one category is required.");
    }
    return uniqueOrdered;
  }

  private normalizeLevelRules(
    levelRules?: Array<{ levelName: string; minTotalSpend: number; cashbackPercent: number }>,
  ) {
    const rules = (levelRules ?? [{ levelName: "Bronze", minTotalSpend: 0, cashbackPercent: 0 }])
      .map((item, index) => ({
        levelName: item.levelName.trim() || `Level ${index + 1}`,
        minTotalSpend: Number(item.minTotalSpend),
        cashbackPercent: Number(item.cashbackPercent),
      }))
      .filter((item) => item.levelName.length > 0);

    if (rules.length === 0) {
      throw new BadRequestException("At least one level rule is required.");
    }

    rules.sort((a, b) => a.minTotalSpend - b.minTotalSpend);

    for (let i = 0; i < rules.length; i += 1) {
      const current = rules[i];
      if (!Number.isFinite(current.minTotalSpend) || current.minTotalSpend < 0) {
        throw new BadRequestException("Level minimum spend must be >= 0.");
      }
      if (
        !Number.isFinite(current.cashbackPercent) ||
        current.cashbackPercent < 0 ||
        current.cashbackPercent > 100
      ) {
        throw new BadRequestException("Cashback percent must be between 0 and 100.");
      }
      if (i > 0 && current.minTotalSpend === rules[i - 1].minTotalSpend) {
        throw new BadRequestException("Level minimum spend values must be unique.");
      }
      if (i > 0 && current.cashbackPercent < rules[i - 1].cashbackPercent) {
        throw new BadRequestException(
          "Cashback percent cannot be higher on lower levels. Cashback must increase or stay the same with level spend thresholds.",
        );
      }
    }

    return rules;
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
    const slug = await this.createUniqueCategorySlug(dto.slug || dto.name);
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
    const slug =
      dto.slug !== undefined ? await this.createUniqueCategorySlug(dto.slug, existing.id) : undefined;
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(slug !== undefined ? { slug } : {}),
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
    const companyCategoryRefs = await this.prisma.companyCategory.count({ where: { categoryId: id } });
    if (companyRefs > 0 || companyCategoryRefs > 0) {
      throw new BadRequestException("Cannot delete category linked to companies.");
    }
    await this.prisma.category.delete({ where: { id } });
    return { success: true as const };
  }

  async listCompanyUsers(query?: string) {
    const q = query?.trim();
    const where = {
      role: UserRole.COMPANY,
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" as const } },
              { name: { contains: q, mode: "insensitive" as const } },
              { uuid: { contains: q } },
            ],
          }
        : {}),
    } satisfies Prisma.UserWhereInput;

    try {
      return await this.prisma.user.findMany({
        where,
        include: {
          managedCompany: {
            select: {
              id: true,
              slug: true,
              name: true,
              isActive: true,
              category: { select: { id: true, name: true } },
              categories: {
                select: {
                  categoryId: true,
                  category: { select: { id: true, name: true, slug: true, icon: true } },
                },
              },
              subscriptionSpendPolicy: true,
              levelRules: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  levelName: true,
                  minTotalSpend: true,
                  cashbackPercent: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2022"
      ) {
        const fallbackRows = await this.prisma.user.findMany({
          where,
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

        return fallbackRows.map((row) => ({
          ...row,
          managedCompany: row.managedCompany
            ? {
                ...row.managedCompany,
                categories: [],
                subscriptionSpendPolicy: SubscriptionSpendPolicy.EXCLUDE,
                levelRules: [],
              }
            : null,
        }));
      }
      throw error;
    }
  }

  async getCompanyUserByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        managedCompany: {
          include: {
            category: true,
            categories: {
              include: {
                category: true,
              },
            },
            levelRules: {
              orderBy: { sortOrder: "asc" },
            },
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
    const categoryIds = this.normalizeCompanyCategoryIds(dto);
    const levelRules = this.normalizeLevelRules(
      dto.levelRules ??
        user.managedCompany?.levelRules?.map((rule) => ({
          levelName: rule.levelName,
          minTotalSpend: Number(rule.minTotalSpend),
          cashbackPercent: Number(rule.cashbackPercent),
        })),
    );
    const subscriptionSpendPolicy =
      (dto.subscriptionSpendPolicy as SubscriptionSpendPolicy | undefined) ??
      user.managedCompany?.subscriptionSpendPolicy ??
      SubscriptionSpendPolicy.EXCLUDE;
    const minRedeem = Number(
      dto.pointsPerReward ?? user.managedCompany?.pointsPerReward ?? 100,
    );
    if (!Number.isFinite(minRedeem) || minRedeem < 1) {
      throw new BadRequestException("Min redeem must be at least 1.");
    }
    const primaryCategoryId = categoryIds[0];
    const slugBase = dto.slug || dto.name;
    const slug = await this.createUniqueCompanySlug(slugBase, user.managedCompany?.id);
    if (!slug) throw new BadRequestException("Company slug is invalid.");
    const existingCategories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (existingCategories.length !== categoryIds.length) {
      throw new NotFoundException("One or more categories not found");
    }

    if (user.managedCompany) {
      return this.prisma.$transaction(async (tx) => {
        const company = await tx.company.update({
          where: { id: user.managedCompany!.id },
          data: {
            name: dto.name.trim(),
            slug,
            description: dto.description?.trim() || null,
            categoryId: primaryCategoryId,
            pointsPerReward: minRedeem,
            subscriptionSpendPolicy,
            isActive: dto.isActive ?? true,
          },
        });
        await tx.companyCategory.deleteMany({ where: { companyId: company.id } });
        await tx.companyCategory.createMany({
          data: categoryIds.map((categoryId) => ({ companyId: company.id, categoryId })),
          skipDuplicates: true,
        });
        await tx.companyLevelRule.deleteMany({ where: { companyId: company.id } });
        await tx.companyLevelRule.createMany({
          data: levelRules.map((rule, index) => ({
            companyId: company.id,
            levelName: rule.levelName,
            minTotalSpend: new Prisma.Decimal(rule.minTotalSpend),
            cashbackPercent: new Prisma.Decimal(rule.cashbackPercent),
            sortOrder: index + 1,
          })),
        });
        return tx.company.findUnique({
          where: { id: company.id },
          include: {
            category: true,
            categories: { include: { category: true } },
            levelRules: { orderBy: { sortOrder: "asc" } },
          },
        });
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
          categoryId: primaryCategoryId,
          pointsPerReward: minRedeem,
          subscriptionSpendPolicy,
          isActive: dto.isActive ?? true,
          ownerUserId: user.id,
        },
      });
      await tx.companyCategory.createMany({
        data: categoryIds.map((categoryId) => ({ companyId: company.id, categoryId })),
        skipDuplicates: true,
      });
      await tx.companyLevelRule.createMany({
        data: levelRules.map((rule, index) => ({
          companyId: company.id,
          levelName: rule.levelName,
          minTotalSpend: new Prisma.Decimal(rule.minTotalSpend),
          cashbackPercent: new Prisma.Decimal(rule.cashbackPercent),
          sortOrder: index + 1,
        })),
      });
      return tx.company.findUnique({
        where: { id: company.id },
        include: {
          category: true,
          categories: { include: { category: true } },
          levelRules: { orderBy: { sortOrder: "asc" } },
        },
      });
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

  async listCompanyClients(
    companyUserUuid: string,
    query?: string,
    page = 1,
    limit = 20,
    sortBy: "name" | "email" | "balance" | "earned" | "spent" | "level" | "updatedAt" = "updatedAt",
    sortDir: "asc" | "desc" = "desc",
  ) {
    const user = await this.requireCompanyUser(companyUserUuid);
    if (!user.managedCompany) {
      return {
        items: [],
        total: 0,
        page: 1,
        limit: Math.max(1, Math.min(100, Number(limit) || 20)),
        totalPages: 0,
        sortBy,
        sortDir,
      };
    }

    const q = query?.trim();
    const companyId = user.managedCompany.id;
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const safePage = Math.max(1, Number(page) || 1);
    const direction = sortDir === "asc" ? 1 : -1;

    const [links, groupedTransactions, levelRules] = await Promise.all([
      this.prisma.userCompany.findMany({
        where: {
          companyId,
          ...(q
            ? {
                user: {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { uuid: { contains: q } },
                  ],
                },
              }
            : {}),
        },
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              uuid: true,
              name: true,
              email: true,
              accountStatus: true,
              createdAt: true,
            },
          },
        },
        take: 500,
      }),
      this.prisma.loyaltyTransaction.groupBy({
        by: ["userId", "type"],
        where: {
          companyId,
          ...(q
            ? {
                user: {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { uuid: { contains: q } },
                  ],
                },
              }
            : {}),
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.companyLevelRule.findMany({
        where: { companyId },
        orderBy: { sortOrder: "asc" },
        select: {
          levelName: true,
          minTotalSpend: true,
          cashbackPercent: true,
        },
      }),
    ]);

    const totalsByUser = new Map<number, { earned: number; spent: number }>();
    for (const row of groupedTransactions) {
      const current = totalsByUser.get(row.userId) ?? { earned: 0, spent: 0 };
      const sumAmount = Number(row._sum.amount ?? 0);
      if (row.type === "EARN") current.earned += sumAmount;
      if (row.type === "SPEND") current.spent += sumAmount;
      totalsByUser.set(row.userId, current);
    }

    const items = links.map((link) => {
      const totals = totalsByUser.get(link.userId) ?? { earned: 0, spent: 0 };
      const level =
        [...levelRules]
          .reverse()
          .find((rule) => totals.spent >= Number(rule.minTotalSpend)) ?? null;

      return {
        userId: link.userId,
        userUuid: link.user.uuid,
        name: link.user.name,
        email: link.user.email,
        accountStatus: link.user.accountStatus,
        userCreatedAt: link.user.createdAt,
        linkCreatedAt: link.createdAt,
        linkUpdatedAt: link.updatedAt,
        balance: link.balance,
        totalEarnedPoints: totals.earned,
        totalSpentPoints: totals.spent,
        currentLevel: level
          ? {
              levelName: level.levelName,
              cashbackPercent: Number(level.cashbackPercent),
            }
          : null,
      };
    });

    const sorted = [...items].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name) * direction;
      if (sortBy === "email") return a.email.localeCompare(b.email) * direction;
      if (sortBy === "balance") return (a.balance - b.balance) * direction;
      if (sortBy === "earned") return (a.totalEarnedPoints - b.totalEarnedPoints) * direction;
      if (sortBy === "spent") return (a.totalSpentPoints - b.totalSpentPoints) * direction;
      if (sortBy === "level") {
        return (
          ((a.currentLevel?.cashbackPercent ?? -1) - (b.currentLevel?.cashbackPercent ?? -1)) *
          direction
        );
      }
      return (
        (new Date(a.linkUpdatedAt).getTime() - new Date(b.linkUpdatedAt).getTime()) * direction
      );
    });

    const total = sorted.length;
    const totalPages = Math.ceil(total / safeLimit);
    const start = (safePage - 1) * safeLimit;

    return {
      items: sorted.slice(start, start + safeLimit),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      sortBy,
      sortDir,
    };
  }

  async createCompanySubscription(companyUserUuid: string, dto: CreateCompanySubscriptionDto) {
    const user = await this.requireCompanyUser(companyUserUuid);
    if (!user.managedCompany) {
      throw new BadRequestException("Company profile must exist before creating subscriptions.");
    }
    const slug = await this.createUniqueSubscriptionSlug(dto.slug || dto.name);
    if (!slug) throw new BadRequestException("Subscription slug is invalid.");

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException("Category not found");
    }

    const renewalValue = dto.renewalValue ?? 1;
    const renewalUnit = this.parseRenewalUnit(dto.renewalUnit ?? "month");
    const promoBonusDays = Math.max(0, dto.promoBonusDays ?? 0);
    const promoEndsAt = dto.promoEndsAt ? new Date(dto.promoEndsAt) : null;
    const renewalPeriod =
      dto.renewalPeriod?.trim() ||
      this.buildRenewalLabel(renewalValue, renewalUnit, promoBonusDays);

    return this.prisma.subscription.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description.trim(),
        price: new Prisma.Decimal(dto.price),
        renewalPeriod,
        renewalValue,
        renewalUnit,
        promoBonusDays,
        promoEndsAt,
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
    const nextSlug =
      dto.slug !== undefined
        ? await this.createUniqueSubscriptionSlug(dto.slug, sub.id)
        : undefined;
    const nextRenewalValue = dto.renewalValue ?? sub.renewalValue;
    const nextRenewalUnit = dto.renewalUnit
      ? this.parseRenewalUnit(dto.renewalUnit)
      : AdminService.RENEWAL_UNITS.includes((sub.renewalUnit ?? "").toLowerCase() as never)
        ? ((sub.renewalUnit ?? "").toLowerCase() as "week" | "month" | "year")
        : "month";
    const nextPromoBonusDays = dto.promoBonusDays ?? sub.promoBonusDays ?? 0;
    const nextPromoEndsAt =
      dto.promoEndsAt === undefined
        ? sub.promoEndsAt
        : dto.promoEndsAt
          ? new Date(dto.promoEndsAt)
          : null;
    const nextRenewalLabel =
      dto.renewalPeriod?.trim() ??
      this.buildRenewalLabel(nextRenewalValue, nextRenewalUnit, nextPromoBonusDays);
    return this.prisma.subscription.update({
      where: { uuid: subscriptionUuid },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.price !== undefined ? { price: new Prisma.Decimal(dto.price) } : {}),
        renewalPeriod: nextRenewalLabel,
        renewalValue: nextRenewalValue,
        renewalUnit: nextRenewalUnit,
        promoBonusDays: nextPromoBonusDays,
        promoEndsAt: nextPromoEndsAt,
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
