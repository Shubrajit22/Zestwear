// app/api/products/[productId]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: { productId?: string } }
) {
  const { productId } = await context.params; // <-- await here

  if (!productId) {
    return NextResponse.json(
      { message: "Product ID is missing" },
      { status: 400 }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { productId?: string } }
) {
  const { productId } = await context.params; // <-- await here

  if (!productId) {
    return NextResponse.json(
      { message: "Product ID is missing" },
      { status: 400 }
    );
  }

  try {
    const { rating, comment, userId } = await req.json();

    if (rating == null || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        comment,
        rating,
        userId,
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Failed to create review" },
      { status: 500 }
    );
  }
}
