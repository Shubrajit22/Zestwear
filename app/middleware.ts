import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // ✅ Check isAdmin from JWT
      if (!decoded.isAdmin) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
