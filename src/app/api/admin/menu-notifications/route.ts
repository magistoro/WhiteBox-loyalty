import { NextResponse, type NextRequest } from "next/server";
import type { CompanyVerificationStatus } from "@prisma/client";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const OPEN_VERIFICATION_STATUSES: CompanyVerificationStatus[] = ["SUBMITTED", "REVIEWING"];

export async function GET(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;

  if (session.role === "SUPPORT") {
    return NextResponse.json({
      items: {},
      sections: {},
    });
  }

  const companyVerificationCount = await prisma.companyVerificationApplication.count({
    where: { status: { in: OPEN_VERIFICATION_STATUSES } },
  });

  return NextResponse.json({
    items: {
      "/admin/company-verifications": companyVerificationCount,
    },
    sections: {
      "admin.nav.usersPartners": companyVerificationCount,
    },
  });
}
