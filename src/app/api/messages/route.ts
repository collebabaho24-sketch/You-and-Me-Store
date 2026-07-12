import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  listingId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { listingId, receiverId, content } = parsed.data;

  if (receiverId === session.user.id) {
    return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      listingId,
      senderId: session.user.id,
      receiverId,
      content,
    },
  });

  return NextResponse.json(message, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true } },
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  // Collapse into one row per (listing, other user) conversation.
  const conversations = new Map<
    string,
    {
      listingId: string;
      listingTitle: string;
      otherUserId: string;
      otherUserName: string;
      lastMessage: string;
      lastMessageAt: string;
    }
  >();

  for (const m of messages) {
    const otherUser = m.senderId === session.user.id ? m.receiver : m.sender;
    const key = `${m.listingId}:${otherUser.id}`;
    if (!conversations.has(key)) {
      conversations.set(key, {
        listingId: m.listingId,
        listingTitle: m.listing.title,
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        lastMessage: m.content,
        lastMessageAt: m.createdAt.toISOString(),
      });
    }
  }

  return NextResponse.json(Array.from(conversations.values()));
}
