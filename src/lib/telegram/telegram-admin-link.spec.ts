jest.mock("@/lib/prisma", () => ({
  prisma: {
    telegramLinkToken: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: { update: jest.fn() },
    $transaction: jest.fn((operations: unknown[]) => Promise.all(operations)),
  },
}));

jest.mock("@/lib/telegram/telegram-service", () => ({
  sendTelegramMessage: jest.fn(),
  answerTelegramCallbackQuery: jest.fn(),
}));

jest.mock("@/lib/leads/landing-leads", () => ({ updateLandingLeadStatus: jest.fn() }));
jest.mock("@/lib/telegram/telegram-webhook", () => ({
  extractLeadUuidFromText: jest.fn(),
  labelFromLeadAction: jest.fn(),
  parseLeadCallbackData: jest.fn(),
  statusFromLeadAction: jest.fn(),
}));

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram/telegram-service";
import { POST } from "@/app/api/telegram/webhook/route";

const mockedPrisma = jest.mocked(prisma, { shallow: false });
const mockedSend = jest.mocked(sendTelegramMessage);

describe("telegram admin link webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
  });

  it("links admin when Telegram strips deep-link payload and exactly one token is active", async () => {
    const token = {
      id: 10,
      token: "abc",
      userId: 7,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 7 },
    };
    mockedPrisma.telegramLinkToken.findMany.mockResolvedValue([token] as never);
    mockedPrisma.user.update.mockResolvedValue({} as never);
    mockedPrisma.telegramLinkToken.update.mockResolvedValue({} as never);
    mockedSend.mockResolvedValue({ ok: true, result: { message_id: 1 } });

    const res = await POST(new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      body: JSON.stringify({ message: { text: "/start", from: { id: 1348887499 }, chat: { id: 1348887499 } } }),
    }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { telegramId: BigInt(1348887499) },
    });
  });

  it("asks for a fresh link when plain start has ambiguous active tokens", async () => {
    mockedPrisma.telegramLinkToken.findMany.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ] as never);
    mockedSend.mockResolvedValue({ ok: true, result: { message_id: 1 } });

    const res = await POST(new NextRequest("http://localhost/api/telegram/webhook", {
      method: "POST",
      body: JSON.stringify({ message: { text: "/start", from: { id: 1348887499 }, chat: { id: 1348887499 } } }),
    }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("missing_payload");
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });
});
