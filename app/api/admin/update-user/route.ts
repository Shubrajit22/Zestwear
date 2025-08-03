// app/api/admin/update-user/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, mobile, isAdmin } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, mobile, isAdmin },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update Error:', error);
    return new NextResponse('Error updating user', { status: 500 });
  }
}
