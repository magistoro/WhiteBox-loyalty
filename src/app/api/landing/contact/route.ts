import { NextResponse, type NextRequest } from "next/server";
import {
  assertHumanTiming,
  createLandingLead,
  hasHoneypotValue,
  adminTelegramRecipients,
  notifyLandingLead,
  parseLandingLeadPayload,
} from "@/lib/leads/landing-leads";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function cleanupRateLimit(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) rateLimitStore.delete(key);
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
    throw new Error("Too many requests. Please try again a little later.");
  }

  entry.count += 1;
}

function statusForMessage(message: string) {
  if (message.includes("Too many") || message.includes("too fast") || message.includes("already been sent")) {
    return 429;
  }
  return 400;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    if (hasHoneypotValue(payload)) {
      return NextResponse.json({ ok: true, message: "Thanks, request received." });
    }

    assertHumanTiming(payload.startedAt);

    const ipAddress = getClientIp(request);
    assertRateLimit(ipAddress);

    const lead = parseLandingLeadPayload(payload);
    const leadRecord = await createLandingLead({
      lead,
      meta: {
        ipAddress,
        userAgent: request.headers.get("user-agent"),
      },
    });

    const notification = await notifyLandingLead({
      leadRecord,
      recipients: await adminTelegramRecipients(),
    });

    return NextResponse.json({
      ok: true,
      leadUuid: leadRecord.uuid,
      notification,
      message:
        notification.sent > 0
          ? "Request received. I already got the Telegram notification."
          : "Request saved. Telegram notification will be retried from the admin panel.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit request.";
    return NextResponse.json({ message }, { status: statusForMessage(message) });
  }
}
