const mockPrisma = {
  user: {
    findMany: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
jest.mock("@/lib/telegram/telegram-service", () => ({
  buildLeadInlineKeyboard: jest.fn(),
  renderLandingLeadHtmlMessage: jest.fn(() => "message"),
  sendTelegramMessage: jest.fn(),
}));

import {
  adminTelegramRecipients,
  assertHumanTiming,
  buildLeadFingerprint,
  calculateSpamScore,
  hasHoneypotValue,
  nextRetryAt,
  normalizeLeadField,
  parseLandingLeadPayload,
} from "./landing-leads";

describe("landing lead helpers", () => {
  const lead = {
    name: "Max",
    company: "Urban Retail",
    contact: "maksim@example.com",
    business: "Retail",
    message: "I want to test WhiteBox pilot",
  };

  it("normalizes fields and parses required payload", () => {
    expect(normalizeLeadField("  hello   whitebox  ")).toBe("hello whitebox");
    expect(parseLandingLeadPayload({ ...lead, name: "  Max  " })).toEqual(lead);
  });

  it("rejects missing required fields", () => {
    expect(() => parseLandingLeadPayload({ ...lead, contact: "" })).toThrow("required");
  });

  it("detects random honeypots", () => {
    expect(hasHoneypotValue({ website: "" })).toBe(false);
    expect(hasHoneypotValue({ url: "https://spam.test" })).toBe(true);
    expect(hasHoneypotValue({ companyWebsite: "bot" })).toBe(true);
  });

  it("blocks impossibly fast submissions", () => {
    expect(() => assertHumanTiming(1_000, 2_000)).toThrow("too fast");
    expect(() => assertHumanTiming(1_000, 5_000)).not.toThrow();
  });

  it("creates stable fingerprints", () => {
    const meta = { ipAddress: "127.0.0.1", userAgent: "jest" };
    expect(buildLeadFingerprint(lead, meta)).toBe(buildLeadFingerprint({ ...lead }, meta));
    expect(buildLeadFingerprint(lead, meta)).not.toBe(buildLeadFingerprint({ ...lead, contact: "other@example.com" }, meta));
  });

  it("scores suspicious submissions", () => {
    expect(calculateSpamScore(lead, { ipAddress: "127.0.0.1", userAgent: "jest" })).toBe(0);
    expect(
      calculateSpamScore(
        { ...lead, contact: "unknown", message: "!!!!!!!!!! https://spam.test" },
        { ipAddress: "unknown", userAgent: null },
      ),
    ).toBeGreaterThanOrEqual(4);
  });

  it("backs off retry attempts", () => {
    const now = new Date("2026-05-16T00:00:00.000Z");
    expect(nextRetryAt(1, now).toISOString()).toBe("2026-05-16T00:01:00.000Z");
    expect(nextRetryAt(2, now).toISOString()).toBe("2026-05-16T00:05:00.000Z");
    expect(nextRetryAt(3, now).toISOString()).toBe("2026-05-16T00:15:00.000Z");
  });

  it("builds Telegram recipients from active admins in the database", async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([
      {
        id: 25,
        email: "maksimpastuhov77@gmail.com",
        name: "Max",
        role: "SUPER_ADMIN",
        telegramId: BigInt(1348887499),
      },
      {
        id: 30,
        email: "manager@whitebox.test",
        name: null,
        role: "MANAGER",
        telegramId: BigInt(1000000001),
      },
    ]);

    await expect(adminTelegramRecipients()).resolves.toEqual([
      {
        chatId: "1348887499",
        role: "super_admin",
        label: "Max",
      },
      {
        chatId: "1000000001",
        role: "manager",
        label: "manager@whitebox.test",
      },
    ]);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
        telegramId: { not: null },
        accountStatus: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        telegramId: true,
      },
      orderBy: { id: "asc" },
    });
  });
});
