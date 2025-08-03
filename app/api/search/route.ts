// app/api/search/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma'; // Adjust path if needed

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') || '';

  const results = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    },
    take: 10,
  });

  return NextResponse.json(results);
}
