import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Standardized Secret Key used across all files to fix the Invalid Credentials error
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi"
);

// In Next.js 16+, this MUST be named 'proxy'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // 1. PUBLIC ROUTES (Always allow)
  if (pathname === '/login' || pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. PROTECTED ROUTES
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log("Proxy: No token found, redirecting to login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      
      // Admin specific check
      if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
        console.log("Proxy: Non-admin attempted to access admin route");
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.log("Proxy: Token verification failed (Key mismatch or expired)");
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/dashboard/:path*',
  ],
};