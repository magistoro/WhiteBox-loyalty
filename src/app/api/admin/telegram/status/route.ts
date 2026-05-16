import { NextResponse, type NextRequest } from "next/server";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);
    if (isAuthResponse(session)) return session;

    const admin =
      (await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, email: true, name: true, role: true, telegramId: true },
      })) ??
      (session.email
        ? await prisma.user.findUnique({
            where: { email: session.email },
            select: { id: true, email: true, name: true, role: true, telegramId: true },
          })
        : null);

    if (!admin) {
      return NextResponse.json({ message: "Администратор не найден. Выйдите и войдите снова." }, { status: 404 });
    }

    return NextResponse.json({
      connected: Boolean(admin.telegramId),
      telegramId: admin.telegramId?.toString() ?? null,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Не удалось проверить подключение Telegram" },
      { status: 500 },
    );
  }
}
