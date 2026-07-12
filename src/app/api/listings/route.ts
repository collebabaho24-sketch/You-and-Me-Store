import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const listingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(4000),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  images: z.array(z.string().url()).max(6, "You can upload up to 6 photos.").optional(),
});

const SORT_OPTIONS = {
  newest: { createdAt: "desc" as const },
  price_asc: { price: "asc" as const },
  price_desc: { price: "desc" as const },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") as keyof typeof SORT_OPTIONS | null;
  const mine = searchParams.get("mine") === "true";

  if (mine) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { name: true } } },
    });

    return NextResponse.json(listings);
  }

  const priceFilter: { gte?: number; lte?: number } = {};
  if (minPrice && !Number.isNaN(Number(minPrice))) priceFilter.gte = Number(minPrice);
  if (maxPrice && !Number.isNaN(Number(maxPrice))) priceFilter.lte = Number(maxPrice);

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(category ? { category } : {}),
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: (sort && SORT_OPTIONS[sort]) || SORT_OPTIONS.newest,
    include: { seller: { select: { name: true } } },
  });

  const sellerIds = Array.from(new Set(listings.map((l) => l.sellerId)));
  const ratings = sellerIds.length
    ? await prisma.review.groupBy({
        by: ["revieweeId"],
        where: { revieweeId: { in: sellerIds } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  const ratingBySeller = new Map(
    ratings.map((r) => [r.revieweeId, { average: r._avg.rating ?? 0, count: r._count.rating }])
  );

  const listingsWithRatings = listings.map((l) => ({
    ...l,
    seller: {
      ...l.seller,
      rating: ratingBySeller.get(l.sellerId) ?? { average: 0, count: 0 },
    },
  }));

  return NextResponse.json(listingsWithRatings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Only sellers can create listings." }, { status: 403 });
  }

  if (!session.user.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before creating a listing." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { title, description, price, category, images } = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price,
      category,
      images: images ?? [],
      sellerId: session.user.id,
    },
  });

  return NextResponse.json(listing, { status: 201 });
}
