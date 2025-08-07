// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, password, mobile } = await req.json();

    if (!email && !mobile) {
      return NextResponse.json({ message: 'Email or mobile is required' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const orFilters = [];
    if (email) orFilters.push({ email });
    if (mobile) orFilters.push({ mobile });

    const user = await prisma.user.findFirst({
      where: { OR: orFilters },
    });

    if (!user) {
      return NextResponse.json({ message: 'No user found' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // ✅ Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin, // used in middleware
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Set HttpOnly cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        image: user.image,
        isAdmin: user.isAdmin,
      },
    });

    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
