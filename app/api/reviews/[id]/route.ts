// /app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
