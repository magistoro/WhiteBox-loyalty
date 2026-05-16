import { NextResponse, type NextRequest } from "next/server";
import { isAuthResponse, requireAdminSession } from "@/lib/admin/require-admin-session";
import { readEncryptedPassportFile } from "@/lib/company-onboarding/passport-storage";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function readUuid(params: { uuid?: string } | Promise<{ uuid?: string }>) {
  return Promise.resolve(params).then((resolved) => resolved.uuid ?? "");
}

export async function GET(
  request: NextRequest,
  context: { params: { uuid?: string } | Promise<{ uuid?: string }> },
) {
  const session = await requireAdminSession(request);
  if (isAuthResponse(session)) return session;
  if (session.role === "SUPPORT") {
    return NextResponse.json({ message: "Support users cannot access passport photos" }, { status: 403 });
  }

  const uuid = await readUuid(context.params);
  const application = await prisma.companyVerificationApplication.findUnique({
    where: { uuid },
    select: {
      id: true,
      passportFiles: {
        where: { status: "ACTIVE" },
        orderBy: { uploadedAt: "desc" },
        take: 1,
      },
    },
  });

  const file = application?.passportFiles[0];
  if (!application || !file) {
    return NextResponse.json({ message: "Passport photo not found for this application" }, { status: 404 });
  }

  try {
    const buffer = await readEncryptedPassportFile(file);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${file.originalName || "passport-photo"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    await prisma.passportVerificationFile.update({
      where: { id: file.id },
      data: { status: "MISSING", missingAt: new Date() },
    });
    return NextResponse.json({ message: "Encrypted passport file is missing or cannot be decrypted" }, { status: 410 });
  }
}
