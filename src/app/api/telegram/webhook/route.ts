import { NextResponse, type NextRequest } from "next/server";
import { updateLandingLeadStatus } from "@/lib/leads/landing-leads";
import { prisma } from "@/lib/prisma";
import { answerTelegramCallbackQuery, sendTelegramMessage } from "@/lib/telegram/telegram-service";
import {
  extractLeadUuidFromText,
  labelFromLeadAction,
  parseLeadCallbackData,
  statusFromLeadAction,
} from "@/lib/telegram/telegram-webhook";

export const runtime = "nodejs";

type TelegramCallbackQuery = {
  id?: string;
  data?: string;
  from?: { id?: number; username?: string; first_name?: string };
  message?: { text?: string; caption?: string; chat?: { id?: number | string }; message_id?: number };
};

type TelegramMessage = {
  text?: string;
  from?: { id?: number; username?: string; first_name?: string };
  chat?: { id?: number | string };
};

type TelegramUpdate = { update_id?: number; callback_query?: TelegramCallbackQuery; message?: TelegramMessage };

function isSecretValid(request: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === expected;
}

async function answer(callbackQueryId: string | undefined, text: string, showAlert = false) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !callbackQueryId) return;
  await answerTelegramCallbackQuery({ botToken, callbackQueryId, text, showAlert, proxyUrl: process.env.TELEGRAM_PROXY_URL });
}

async function reply(chatId: string | number | undefined, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || chatId === undefined) return;
  await sendTelegramMessage({ botToken, chatId: String(chatId), text, proxyUrl: process.env.TELEGRAM_PROXY_URL });
}

async function findFallbackStartToken() {
  const tokens = await prisma.telegramLinkToken.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 2,
    include: { user: true },
  });
  return tokens.length === 1 ? tokens[0] : null;
}

async function handleTelegramLink(message: TelegramMessage) {
  if (!message.from?.id) return { skipped: "not_link_start" };

  const match = message.text?.match(/^\/start(?:\s+link_([a-zA-Z0-9_-]+))?$/);
  if (!match) return { skipped: "not_link_start" };

  const token = match[1]
    ? await prisma.telegramLinkToken.findUnique({ where: { token: match[1] }, include: { user: true } })
    : await findFallbackStartToken();

  if (!token && !match[1]) {
    await reply(message.chat?.id, "WhiteBox не получил токен привязки. Откройте защищенную ссылку еще раз или создайте новую ссылку в админке.");
    return { ok: false, message: "missing_payload" };
  }

  if (!token || token.usedAt || token.expiresAt <= new Date()) {
    await reply(message.chat?.id, "Ссылка WhiteBox устарела. Создайте новую ссылку в админке.");
    return { ok: false, message: "expired" };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { telegramId: BigInt(message.from.id) } }),
    prisma.telegramLinkToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);

  await reply(message.chat?.id, "Telegram подключен к WhiteBox. Теперь сюда будут приходить админские уведомления.");
  return { ok: true, linkedUserId: token.userId };
}

export async function POST(request: NextRequest) {
  if (!isSecretValid(request)) return NextResponse.json({ ok: false, message: "Invalid Telegram secret" }, { status: 401 });

  const update = (await request.json().catch(() => ({}))) as TelegramUpdate;

  if (update.message) {
    return NextResponse.json(await handleTelegramLink(update.message));
  }

  const callback = update.callback_query;
  if (!callback) return NextResponse.json({ ok: true, skipped: "not_callback_query" });

  const parsed = parseLeadCallbackData(callback.data);
  if (!parsed) {
    await answer(callback.id, "Неизвестное действие WhiteBox", true);
    return NextResponse.json({ ok: true, skipped: "unknown_callback" });
  }

  const leadUuid = parsed.leadUuid || extractLeadUuidFromText(callback.message?.text) || extractLeadUuidFromText(callback.message?.caption);
  if (!leadUuid) {
    await answer(callback.id, "ID заявки не найден. Откройте админку.", true);
    return NextResponse.json({ ok: false, message: "Lead uuid not found" }, { status: 400 });
  }

  try {
    const status = statusFromLeadAction(parsed.action);
    await updateLandingLeadStatus({
      leadUuid,
      status,
      notes: `Быстрое действие из Telegram: ${labelFromLeadAction(parsed.action)}. Исполнитель: ${callback.from?.username ? `@${callback.from.username}` : callback.from?.first_name || callback.from?.id || "неизвестно"}`,
    });
    await answer(callback.id, `Заявка отмечена как ${labelFromLeadAction(parsed.action)}.`);
    return NextResponse.json({ ok: true, leadUuid, status });
  } catch (error) {
    await answer(callback.id, "Не удалось обновить заявку. Проверьте админку.", true);
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Failed to update lead" }, { status: 500 });
  }
}
