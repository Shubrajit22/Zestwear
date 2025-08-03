// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get('token')?.value; // Use JWT or session logic here
  const isAdmin = req.cookies.get('isAdmin')?.value === 'true';

  if (req.nextUrl.pathname.startsWith('/admin') && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}
