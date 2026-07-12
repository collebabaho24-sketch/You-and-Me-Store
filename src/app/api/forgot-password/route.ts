import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only send a reset link for accounts with a password (not OAuth-only),
  // but always respond the same way to avoid leaking which emails exist.
  if (user?.passwordHash) {
    const token = await createToken(user.id, "RESET");
    const base = process.env.NEXTAUTH_URL || new URL(req.url).origin;
    await sendPasswordResetEmail(user.email, `${base}/reset-password?token=${token}`);
  }

  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, we've sent a password reset link.",
  });
}
