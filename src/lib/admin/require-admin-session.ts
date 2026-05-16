import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

export type AdminSession = {
  userId: number;
  email?: string;
  role: "ADMIN" | "SUPER_ADMIN" | "MANAGER" | "SUPPORT";
};

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "MANAGER", "SUPPORT"]);

function readBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return request.cookies.get("wb_access_token")?.value ?? null;
}

export async function requireAdminSession(request: NextRequest): Promise<AdminSession | NextResponse> {
  const token = readBearerToken(request);
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = typeof payload.role === "string" ? payload.role : "";

    if (!ADMIN_ROLES.has(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return {
      userId: Number(payload.sub ?? 0),
      email: typeof payload.email === "string" ? payload.email : undefined,
      role: role as AdminSession["role"],
    };
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export function isAuthResponse(value: AdminSession | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
