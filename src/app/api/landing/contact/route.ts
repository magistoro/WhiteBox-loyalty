import { NextResponse, type NextRequest } from "next/server";
import {
  parseTelegramRecipients,
  renderLandingLeadMessage,
  sendTelegramBroadcast,
  type LandingLead,
} from "@/lib/telegram/telegram-service";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const MIN_FORM_TIME_MS = 2500;
const MAX_FIELD_LENGTH = 1200;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function cleanupRateLimit(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function assertRateLimit(key: string) {
  const now = Date.now();
  cleanupRateLimit(now);

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error("Слишком много заявок. Попробуйте чуть позже.");
  }

  entry.count += 1;
}

function readTextField(payload: Record<string, unknown>, key: string, required = false) {
  const value = typeof payload[key] === "string" ? payload[key].trim() : "";

  if (required && value.length === 0) {
    throw new Error("Заполните обязательные поля.");
  }

  if (value.length > MAX_FIELD_LENGTH) {
    throw new Error("Сообщение слишком длинное.");
  }

  return value;
}

function parseLandingLead(payload: Record<string, unknown>): LandingLead {
  return {
    name: readTextField(payload, "name", true),
    company: readTextField(payload, "company"),
    contact: readTextField(payload, "contact", true),
    business: readTextField(payload, "business"),
    message: readTextField(payload, "message", true),
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    // Honeypot: real users never fill this hidden field, bots often do.
    if (readTextField(payload, "website").length > 0) {
      return NextResponse.json({ ok: true });
    }

    const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;

    if (startedAt > 0 && Date.now() - startedAt < MIN_FORM_TIME_MS) {
      return NextResponse.json(
        { message: "Форма отправлена слишком быстро. Попробуйте ещё раз." },
        { status: 429 },
      );
    }

    assertRateLimit(getClientIp(request));

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const recipients = parseTelegramRecipients(
      process.env.TELEGRAM_CONTACT_RECIPIENTS || process.env.TELEGRAM_OWNER_CHAT_ID,
    );

    if (!botToken || recipients.length === 0) {
      return NextResponse.json(
        { message: "Telegram уведомления пока не настроены." },
        { status: 503 },
      );
    }

    const lead = parseLandingLead(payload);

    await sendTelegramBroadcast({
      botToken,
      recipients,
      text: renderLandingLeadMessage(lead),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось отправить заявку.";
    const isTelegramError = message.startsWith("Telegram");
    const status = message.includes("Слишком много") ? 429 : isTelegramError ? 502 : 400;

    return NextResponse.json(
      { message: isTelegramError ? "Telegram временно не принял заявку. Попробуйте ещё раз." : message },
      { status },
    );
  }
}
