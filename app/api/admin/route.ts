import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'dashboard') {
      const [usersCount, ordersCount, productsCount, reviewsCount] = await prisma.$transaction([
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.count(),
        prisma.review.count(),
      ]);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

      const [revenueToday, revenueMonth, revenueAllTime] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { createdAt: { gte: startOfToday } },
        }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { createdAt: { gte: startOfMonth } },
        }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
        }),
      ]);

      return NextResponse.json({
        usersCount,
        ordersCount,
        productsCount,
        reviewsCount,
        revenueToday: revenueToday._sum.totalAmount || 0,
        revenueMonth: revenueMonth._sum.totalAmount || 0,
        revenueAllTime: revenueAllTime._sum.totalAmount || 0,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
