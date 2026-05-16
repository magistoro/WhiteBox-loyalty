import { NextResponse, type NextRequest } from "next/server";
import type { PermissionScope } from "@prisma/client";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SCOPES: PermissionScope[] = [
  "USERS",
  "COMPANIES",
  "COMPANY_VERIFICATIONS",
  "FINANCE",
  "SUPPORT",
  "AUDIT",
  "DATABASE",
  "TELEGRAM",
  "SETTINGS",
];

async function readUuid(params: { uuid?: string } | Promise<{ uuid?: string }>) {
  return (await Promise.resolve(params)).uuid ?? "";
}

async function getActor(session: Awaited<ReturnType<typeof requireAdminSession>>) {
  if (isAuthResponse(session)) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, email: true, name: true },
  });
}

function defaultsForRole(role: string) {
  return SCOPES.map((scope) => {
    if (role === "SUPER_ADMIN" || role === "ADMIN") return { scope, canView: true, canEdit: true, canApprove: true };
    if (role === "MANAGER") {
      const canApprove = scope === "FINANCE" ? false : scope === "COMPANY_VERIFICATIONS";
      return {
        scope,
        canView: ["USERS", "COMPANIES", "COMPANY_VERIFICATIONS", "FINANCE", "SUPPORT", "AUDIT", "TELEGRAM"].includes(scope),
        canEdit: ["COMPANIES", "COMPANY_VERIFICATIONS", "FINANCE", "SUPPORT"].includes(scope),
        canApprove,
      };
    }
    if (role === "SUPPORT") return { scope, canView: scope === "SUPPORT" || scope === "USERS", canEdit: scope === "SUPPORT", canApprove: false };
    return { scope, canView: false, canEdit: false, canApprove: false };
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { uuid?: string } | Promise<{ uuid?: string }> },
) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;

  const uuid = await readUuid(context.params);
  const user = await prisma.user.findUnique({
    where: { uuid },
    select: { id: true, uuid: true, name: true, email: true, role: true, permissions: true },
  });

  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const explicit = new Map(user.permissions.map((permission) => [permission.scope, permission]));
  const permissions = defaultsForRole(user.role).map((fallback) => explicit.get(fallback.scope) ?? fallback);

  return NextResponse.json({ user: { uuid: user.uuid, name: user.name, email: user.email, role: user.role }, scopes: SCOPES, permissions });
}

export async function PUT(
  request: NextRequest,
  context: { params: { uuid?: string } | Promise<{ uuid?: string }> },
) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;

  const actor = await getActor(session);
  if (!actor || (actor.role !== "SUPER_ADMIN" && actor.role !== "ADMIN")) {
    return NextResponse.json({ message: "Only SUPER_ADMIN can edit individual access settings" }, { status: 403 });
  }

  const uuid = await readUuid(context.params);
  const body = (await request.json().catch(() => ({}))) as {
    permissions?: Array<{ scope: PermissionScope; canView?: boolean; canEdit?: boolean; canApprove?: boolean }>;
  };

  const user = await prisma.user.findUnique({ where: { uuid }, select: { id: true, uuid: true, email: true } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  const safePermissions = permissions.filter((permission) => SCOPES.includes(permission.scope));

  await prisma.$transaction(async (tx) => {
    for (const permission of safePermissions) {
      await tx.adminUserPermission.upsert({
        where: { userId_scope: { userId: user.id, scope: permission.scope } },
        create: {
          userId: user.id,
          scope: permission.scope,
          canView: permission.canView === true,
          canEdit: permission.canEdit === true,
          canApprove: permission.canApprove === true,
        },
        update: {
          canView: permission.canView === true,
          canEdit: permission.canEdit === true,
          canApprove: permission.canApprove === true,
        },
      });
    }
    await tx.auditEvent.create({
      data: {
        workspace: "DEVELOPER",
        level: "WARN",
        category: "SECURITY",
        action: "Admin permissions updated",
        actorUserId: actor.id,
        actorLabel: actor.email,
        targetUserId: user.id,
        targetEmail: user.email,
        targetUuid: user.uuid,
        tags: ["#SECURITY", "#RBAC"],
      },
    });
  });

  return GET(request, context);
}
