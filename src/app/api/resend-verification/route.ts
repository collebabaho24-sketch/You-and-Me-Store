import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.emailVerified) {
    return NextResponse.json({ error: "Your email is already verified." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = await createToken(user.id, "VERIFY");
  const base = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  await sendVerificationEmail(user.email, `${base}/verify-email?token=${token}`);

  return NextResponse.json({ ok: true });
}
