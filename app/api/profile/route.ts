import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ✅ GET Profile
export async function GET() {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    // If the session is not found or the user email is missing, return an error
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Fetch the user and include orders and orderItems with product details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        addresses: true,
        orders: {
          include: {
            orderItems: {
              include: {
                product: true // Include the related product for each order item
              }
            }
          }
        }
      }
    });

    // If user not found, return a 404 error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the user data with all the details
    return NextResponse.json(user);

  } catch (error) {
    // Log the error for debugging purposes
    console.error('GET /api/profile error:', error);

    // Return an internal server error response
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ✅ PUT Profile Update
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { name, email, mobile } = body;

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  try {
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: { name, email, mobile },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// ✅ POST Add Address
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { address } = body;

  if (!session?.user?.email || !address) {
    return NextResponse.json({ error: 'Missing session or address' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
    const added = await prisma.address.create({
      data: {
        userId: user.id,
        address,
      },
    });

    return NextResponse.json(added);
  } catch (error) {
    console.error('POST /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}

// ✅ DELETE Address
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const addressId = searchParams.get('addressId');

  if (!addressId) {
    return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
  }

  try {
    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
