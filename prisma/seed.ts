import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: {
      name: "Sam Seller",
      email: "seller@example.com",
      passwordHash,
      role: "SELLER",
      emailVerified: new Date(),
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      name: "Bailey Buyer",
      email: "buyer@example.com",
      passwordHash,
      role: "BUYER",
      emailVerified: new Date(),
    },
  });

  const existingListings = await prisma.listing.count({ where: { sellerId: seller.id } });

  if (existingListings === 0) {
    await prisma.listing.createMany({
      data: [
        {
          title: "Vintage Bicycle",
          description: "Well-maintained vintage road bike, great for commuting.",
          price: 150,
          category: "Vehicles",
          condition: "USED",
          location: "UK",
          sellerId: seller.id,
        },
        {
          title: "Handmade Ceramic Mug Set",
          description: "Set of 4 handmade ceramic mugs, microwave and dishwasher safe.",
          price: 32,
          category: "Home & Garden",
          condition: "NEW",
          location: "UK",
          sellerId: seller.id,
        },
        {
          title: "Web Design Services",
          description: "I build fast, modern websites for small businesses. Portfolio available.",
          price: 500,
          category: "Services",
          sellerId: seller.id,
        },
        {
          title: "Wedding Videographer for Hire",
          description: "Professional wedding and event videography, full-day coverage with same-week highlight reel.",
          price: 650,
          category: "Videography Services",
          location: "London, UK",
          sellerId: seller.id,
        },
        {
          title: "Product & Portrait Photo Shoots",
          description: "Experienced photographer available for product shoots, portraits, and small events.",
          price: 200,
          category: "Photography Services",
          location: "UK",
          sellerId: seller.id,
        },
        {
          title: "Used iPhone 13, 128GB",
          description: "Used iPhone 13 in good condition, minor wear, battery health 88%. Comes with charger.",
          price: 380,
          category: "Electronics",
          condition: "USED",
          location: "UK",
          sellerId: seller.id,
        },
        {
          title: "Brand New Wireless Headphones",
          description: "Sealed, brand new noise-cancelling wireless headphones, unopened box.",
          price: 220,
          category: "Electronics",
          condition: "NEW",
          sellerId: seller.id,
        },
      ],
    });
  }

  const bicycle = await prisma.listing.findFirst({ where: { title: "Vintage Bicycle", sellerId: seller.id } });
  const mugs = await prisma.listing.findFirst({
    where: { title: "Handmade Ceramic Mug Set", sellerId: seller.id },
  });

  if (bicycle) {
    await prisma.review.upsert({
      where: { reviewerId_listingId: { reviewerId: buyer.id, listingId: bicycle.id } },
      update: {},
      create: {
        listingId: bicycle.id,
        reviewerId: buyer.id,
        revieweeId: seller.id,
        rating: 5,
        comment: "Exactly as described, smooth transaction and fast reply!",
      },
    });
  }

  if (mugs) {
    await prisma.review.upsert({
      where: { reviewerId_listingId: { reviewerId: buyer.id, listingId: mugs.id } },
      update: {},
      create: {
        listingId: mugs.id,
        reviewerId: buyer.id,
        revieweeId: seller.id,
        rating: 4,
        comment: "Lovely mugs, shipping took a bit longer than expected.",
      },
    });
  }

  console.log("Seeded users:", { seller: seller.email, buyer: buyer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
