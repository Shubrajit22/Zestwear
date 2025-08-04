// /app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 📌 GET — fetch all reviews
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// 📌 POST — add new review + update product rating
export async function POST(req: Request) {
  try {
    const { productId, userId, rating, comment } = await req.json();

    if (!productId || !userId || rating == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Create the review
    await prisma.review.create({
      data: { rating, comment, productId, userId },
    });

    // ✅ Recalculate average rating from all reviews for this product
    const avg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    const newRating = avg._avg.rating ?? 0;

    // ✅ Update product's rating field
    await prisma.product.update({
      where: { id: productId },
      data: { rating: newRating },
    });

    return NextResponse.json({ success: true, rating: newRating });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
  }
}
