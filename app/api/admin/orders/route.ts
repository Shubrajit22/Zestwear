import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// File: /api/admin/orders/route.ts
// route.ts (GET handler)
export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true, // ✅ explicitly include this
              color: true,
              type: true,
              texture: true,
              neckline: true,
              stockImages: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}


export async function PATCH(req: NextRequest) {
  const { orderId, shippingStatus } = await req.json();

  if (!orderId || !shippingStatus) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { shippingStatus },
  });

  return NextResponse.json(updated);
}
