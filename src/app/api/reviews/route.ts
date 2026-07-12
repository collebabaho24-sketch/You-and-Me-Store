import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  listingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");

  if (!sellerId) {
    return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
  }

  const [aggregate, reviews] = await Promise.all([
    prisma.review.aggregate({
      where: { revieweeId: sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { revieweeId: sellerId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reviewer: { select: { name: true } },
        listing: { select: { title: true } },
      },
    }),
  ]);

  return NextResponse.json({
    average: aggregate._avg.rating ?? 0,
    count: aggregate._count.rating,
    reviews,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in to leave a review." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { listingId, rating, comment } = parsed.data;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "You cannot review your own listing." }, { status: 400 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        listingId,
        rating,
        comment: comment || null,
        reviewerId: session.user.id,
        revieweeId: listing.sellerId,
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "You've already reviewed this listing." },
        { status: 409 }
      );
    }
    throw err;
  }
}
