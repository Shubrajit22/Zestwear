import { NextRequest, NextResponse } from 'next/server'; // Use NextRequest and NextResponse
import { prisma } from '@/lib/prisma'; // Your Prisma setup

// Handle GET request
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId'); // Use .get to fetch query params

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: String(userId) },
    });
    return NextResponse.json(addresses, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Error fetching addresses' }, { status: 500 });
  }
}

// Handle POST request
export async function POST(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId'); // Use .get to fetch query params
  const { address } = await req.json(); // Parse the body as JSON

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const newAddress = await prisma.address.create({
      data: { userId: String(userId), address },
    });
    return NextResponse.json(newAddress, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error creating address' }, { status: 500 });
  }
}
