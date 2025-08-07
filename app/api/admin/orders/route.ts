import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth1'; // ✅ Import your session/auth helper

// ✅ Reusable admin checker
async function checkAdmin() {
  const session = await auth();
  if (!session?.user) return { status: 401, message: 'Unauthorized' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.isAdmin) return { status: 403, message: 'Forbidden' };

  return null; // ✅ Passed
}

// ✅ GET /api/admin/orders
export async function GET() {
  const authError = await checkAdmin();
  if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
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

// ✅ PATCH /api/admin/orders
export async function PATCH(req: NextRequest) {
  const authError = await checkAdmin();
  if (authError) return NextResponse.json({ error: authError.message }, { status: authError.status });

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
