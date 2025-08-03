// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductCategoryEnum } from '@prisma/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q')?.trim() || '';

  if (!keyword) {
    return NextResponse.json([], { status: 200 });
  }

  // Find matching category enums
  const matchingCategories = Object.values(ProductCategoryEnum).filter((cat) =>
    cat.toLowerCase().includes(keyword.toLowerCase())
  );

  // Build OR conditions without undefined
  const orConditions: any[] = [
    { name: { contains: keyword, mode: 'insensitive' } },
    { description: { contains: keyword, mode: 'insensitive' } },
  ];

  if (matchingCategories.length > 0) {
    orConditions.push({
      category: { name: { in: matchingCategories } },
    });
  }

  const results = await prisma.product.findMany({
    where: { OR: orConditions },
    include: { category: true },
    take: 10,
  });

  return NextResponse.json(results);
}
