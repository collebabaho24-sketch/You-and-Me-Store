import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export type TokenType = "VERIFY" | "RESET";

const TTL_MS: Record<TokenType, number> = {
  VERIFY: 24 * 60 * 60 * 1000,
  RESET: 60 * 60 * 1000,
};

export async function createToken(userId: string, type: TokenType) {
  // Only one active token per user/type — replace any previous one.
  await prisma.token.deleteMany({ where: { userId, type } });

  const token = randomBytes(32).toString("hex");
  await prisma.token.create({
    data: {
      token,
      type,
      userId,
      expiresAt: new Date(Date.now() + TTL_MS[type]),
    },
  });

  return token;
}

export async function consumeToken(token: string, type: TokenType) {
  const record = await prisma.token.findUnique({ where: { token } });

  if (!record || record.type !== type) {
    return null;
  }

  // deleteMany (rather than delete) never throws if another concurrent
  // request already consumed this token — it just reports 0 rows removed.
  const { count } = await prisma.token.deleteMany({ where: { token } });
  if (count === 0) {
    return null;
  }

  if (record.expiresAt < new Date()) {
    return null;
  }

  return record.userId;
}
