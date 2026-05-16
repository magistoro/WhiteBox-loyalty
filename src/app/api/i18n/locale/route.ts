import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n/shared";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ACCESS_COOKIE = "wb_access_token";
const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

async function getUserId(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = Number(payload.sub ?? 0);
    return Number.isFinite(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

function localeResponse(locale: Locale) {
  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export async function GET(request: NextRequest) {
  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  const userId = await getUserId(request);

  if (userId) {
    const preference = await prisma.userProfilePreference.findUnique({
      where: { userId },
      select: { preferredLocale: true },
    });
    const dbLocale = normalizeLocale(preference?.preferredLocale);
    if (dbLocale) return localeResponse(dbLocale);
  }

  return localeResponse(cookieLocale ?? "en");
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  if (!isLocale(body.locale)) {
    return NextResponse.json({ message: "Unsupported locale" }, { status: 400 });
  }

  const userId = await getUserId(request);
  if (userId) {
    await prisma.userProfilePreference.upsert({
      where: { userId },
      create: { userId, preferredLocale: body.locale },
      update: { preferredLocale: body.locale },
    });
  }

  return localeResponse(body.locale);
}
