import { NextResponse, type NextRequest } from "next/server";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { syncPassportStorage } from "@/lib/company-onboarding/passport-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;
  if (session.role === "SUPPORT") {
    return NextResponse.json({ message: "Support users cannot sync passport storage" }, { status: 403 });
  }

  const result = await syncPassportStorage();
  return NextResponse.json({ ok: true, result });
}
