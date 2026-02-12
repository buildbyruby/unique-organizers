import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Only protect the /admin routes
  if (pathname.startsWith('/admin')) {
    // Skip the login page itself so we don't get a "Too many redirects" error
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;

    // 2. If no token, kick them to login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // 3. Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      // 4. If token is fake/expired, kick them to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// 5. THIS MATCHER IS THE MOST IMPORTANT PART
export const config = {
  matcher: ['/admin/:path*'],
};