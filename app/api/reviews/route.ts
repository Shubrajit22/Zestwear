// /app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: { name: true, image: true },
        },
        product: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
