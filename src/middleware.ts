import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. Only care about /admin. Let /admin/login pass through.
  if (path.startsWith('/admin') && path !== '/admin/login') {
    
    // 2. We changed the name to 'admin_token' to force a fresh start
    const hasToken = request.cookies.has('admin_token')

    if (!hasToken) {
      console.log("🔒 Access Denied. Redirecting to login...");
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    console.log("✅ Access Granted.");
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}