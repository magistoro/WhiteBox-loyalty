import { NextResponse, type NextRequest } from "next/server";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { processLandingLeadRetryQueue } from "@/lib/leads/landing-leads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;

  const result = await processLandingLeadRetryQueue();
  return NextResponse.json({ ok: true, result });
}