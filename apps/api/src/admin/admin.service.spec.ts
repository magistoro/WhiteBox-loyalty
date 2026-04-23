import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AdminService } from "./admin.service";

describe("AdminService", () => {
  let service: AdminService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    category: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    company: {
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    emailChangeRequest: {
      updateMany: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
    userSubscription: { count: jest.Mock };
    subscription: { findUnique: jest.Mock };
  };
  const config = {
    get: (key: string) => {
      if (key === "EMAIL_CHANGE_TOKEN_HOURS") return "24";
      if (key === "FRONTEND_ORIGIN") return "http://localhost:3000";
      return undefined;
    },
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      company: {
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      emailChangeRequest: {
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn().mockResolvedValue([]),
      userSubscription: { count: jest.fn() },
      subscription: { findUnique: jest.fn() },
    };
    service = new AdminService(prisma as never, config as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("createAccount throws conflict on duplicate email", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      service.createAccount({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        role: UserRole.CLIENT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("listUsers passes filters to prisma", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await service.listUsers(UserRole.COMPANY, "max");

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: UserRole.COMPANY,
          OR: expect.any(Array),
        }),
        take: 200,
      }),
    );
  });

  it("getUserByUuid returns transformed shape", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 10,
      uuid: "u-10",
      telegramId: BigInt(123456),
      name: "Max",
      email: "max@example.com",
      role: UserRole.CLIENT,
      accountStatus: "ACTIVE",
      emailVerifiedAt: null,
      deletionScheduledAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      passwordHash: "hash",
      favoriteCategories: [],
      companyLinks: [],
      subscriptions: [],
      refreshTokens: [],
      oauthAccounts: [],
      loginEvents: [],
      loyaltyTransactions: [],
    });

    const result = await service.getUserByUuid("u-10");

    expect(result.telegramId).toBe("123456");
    expect(result.hasPassword).toBe(true);
    expect(result).not.toHaveProperty("passwordHash", "hash");
  });

  it("updateUserByUuid updates allowed fields", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({
        id: 11,
        uuid: "u-11",
      })
      .mockResolvedValueOnce({
        id: 11,
        uuid: "u-11",
        telegramId: null,
        name: "Jane Updated",
        email: "jane@new.com",
        role: UserRole.ADMIN,
        accountStatus: "ACTIVE",
        emailVerifiedAt: null,
        deletionScheduledAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-03T00:00:00.000Z"),
        passwordHash: "hashed-from-bcrypt",
        favoriteCategories: [],
        companyLinks: [],
        subscriptions: [],
        refreshTokens: [],
        oauthAccounts: [],
        loginEvents: [],
        loyaltyTransactions: [],
      });
    prisma.user.update.mockResolvedValue({});

    const result = await service.updateUserByUuid("u-11", {
      name: " Jane Updated ",
      role: UserRole.ADMIN,
      emailVerifiedAt: "2026-01-02T00:00:00.000Z",
    });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { uuid: "u-11" },
        data: expect.objectContaining({
          name: "Jane Updated",
          role: UserRole.ADMIN,
          emailVerifiedAt: new Date("2026-01-02T00:00:00.000Z"),
        }),
      }),
    );
    expect(result.uuid).toBe("u-11");
  });

  it("requestEmailChange creates request and returns preview", async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 12, uuid: "u-12", email: "old@example.com" })
      .mockResolvedValueOnce(null);

    const response = await service.requestEmailChange("u-12", 1, "new@example.com");

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(response.success).toBe(true);
    expect(response.sentTo).toBe("new@example.com");
    expect(response.previewUrl).toContain("/email-change/confirm?token=");
  });

  it("reactivateUserAccountByUuid resets deletion schedule", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, uuid: "u-1" });
    prisma.user.update.mockResolvedValue({
      uuid: "u-1",
      accountStatus: "ACTIVE",
      deletionScheduledAt: null,
      updatedAt: new Date(),
    });

    const result = await service.reactivateUserAccountByUuid("u-1");

    expect(result.accountStatus).toBe("ACTIVE");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { uuid: "u-1" },
        data: expect.objectContaining({
          accountStatus: "ACTIVE",
          deletionScheduledAt: null,
        }),
      }),
    );
  });

  it("createCategory normalizes slug and saves", async () => {
    prisma.category.create.mockResolvedValue({ id: 1, slug: "coffee", name: "Coffee", icon: "Coffee" });

    const result = await service.createCategory({
      slug: " Coffee ",
      name: "Coffee",
      icon: "Coffee",
      description: "desc",
    });

    expect(prisma.category.create).toHaveBeenCalled();
    expect(result.slug).toBe("coffee");
  });

  it("createCompanySubscription requires company profile", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 3, uuid: "c-1", role: "COMPANY", managedCompany: null });

    await expect(
      service.createCompanySubscription("c-1", {
        name: "Monthly",
        description: "desc value",
        price: 10,
        renewalPeriod: "month",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updateUserByUuid throws not found when user does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.updateUserByUuid("missing", {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deleteUserByUuid blocks self-delete", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 55, uuid: "u-55" });

    await expect(service.deleteUserByUuid("u-55", 55)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("deleteUserByUuid removes user", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 77, uuid: "u-77" });
    prisma.user.delete.mockResolvedValue({ id: 77 });

    const result = await service.deleteUserByUuid("u-77", 1);

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { uuid: "u-77" } });
    expect(result.success).toBe(true);
  });
});
