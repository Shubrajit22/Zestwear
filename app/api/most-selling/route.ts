import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate review count & average rating
    const sortedProducts = products
      .map((product) => {
        const reviewCount = product.reviews.length;
        const avgRating =
          reviewCount > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

        return {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          mrpPrice: product.mrpPrice,
          price: product.price,
          reviewCount,
          rating: avgRating,
        };
      })
      // Sort by most reviews first, then by highest rating if same count
      .sort((a, b) =>
        b.reviewCount === a.reviewCount
          ? b.rating - a.rating
          : b.reviewCount - a.reviewCount
      );

    return NextResponse.json(sortedProducts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
