// app/api/stats/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalSales = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });

    return NextResponse.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalSales: totalSales._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
