import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();  // Use .json() to parse the incoming JSON body

    if (action === 'dashboard') {
      // Query data needed for the dashboard
      const usersCount = await prisma.user.count();
      const ordersCount = await prisma.order.count();
      const productsCount = await prisma.product.count();
      const reviewsCount = await prisma.review.count();

      // Revenue stats (optional)
      const revenueToday = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      });

      const revenueMonth = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
      });

      const revenueAllTime = await prisma.order.aggregate({
        _sum: { totalAmount: true },
      });

      return NextResponse.json({
        usersCount,
        ordersCount,
        productsCount,
        reviewsCount,
        revenueToday: revenueToday._sum.totalAmount || 0,
        revenueMonth: revenueMonth._sum.totalAmount || 0,
        revenueAllTime: revenueAllTime._sum.totalAmount || 0,
      });
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// Handle other HTTP methods (GET, etc.)
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
