import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth1';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse(JSON.stringify({ isAdmin: false }), { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.isAdmin) {
    return new NextResponse(JSON.stringify({ isAdmin: false }), { status: 403 });
  }

  return NextResponse.json({ isAdmin: true });
}
