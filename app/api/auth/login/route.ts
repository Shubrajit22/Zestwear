import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password, mobile } = await req.json();

    // Validate inputs
    if (!email && !mobile) {
      return NextResponse.json({ message: 'Email or mobile is required' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    // Build OR filter dynamically (only include provided fields)
    const orFilters = [];
    if (email) orFilters.push({ email });
    if (mobile) orFilters.push({ mobile });

    const user = await prisma.user.findFirst({
      where: {
        OR: orFilters,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'No user found with this email or mobile' }, { status: 400 });
    }

    // Ensure user.password is defined (schema should make it required)
    const hashed = user.password || '';
    const isValid = await bcrypt.compare(password, hashed);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      image: user.image,
    };

    return NextResponse.json({ message: 'Login successful', user: session });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
