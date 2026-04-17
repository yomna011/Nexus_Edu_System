export const runtime = 'nodejs'; // 👈 Must be the very first line

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/set-password'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control
  if (pathname.startsWith('/portal/admin') && !['ADMIN', 'IT_ADMIN'].includes(decoded.role)) {
    return NextResponse.redirect(new URL('/portal/student/dashboard', request.url));
  }
  if (pathname.startsWith('/portal/staff') && !['PROFESSOR', 'TA', 'ADMIN'].includes(decoded.role)) {
    return NextResponse.redirect(new URL('/portal/student/dashboard', request.url));
  }

  // Force password change check (optional – can be handled client‑side)
  // If you stored forcePasswordChange in the JWT, you could check it here.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/set-password',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};