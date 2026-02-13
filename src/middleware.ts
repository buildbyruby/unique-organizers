import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers-2026");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    // Exclude login pages from redirection loops
    if (pathname === '/admin/login' || pathname === '/login') {
      return NextResponse.next();
    }
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect Customer Dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};