import { NextResponse, type NextRequest } from "next/server";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { retryLeadNotifications } from "@/lib/leads/landing-leads";

export const runtime = "nodejs";

type Params = { params: Promise<{ uuid: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;

  const { uuid } = await params;
  const result = await retryLeadNotifications(uuid);
  return NextResponse.json({ ok: true, result });
}