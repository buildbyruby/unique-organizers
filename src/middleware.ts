import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. If we are NOT going to an admin page, or we are already on the login page, ignore.
  if (!path.startsWith('/admin') || path === '/admin/login') {
    return NextResponse.next()
  }

  // 2. Look for the cookie
  const session = request.cookies.get('admin_session')

  // 3. FORCE REDIRECT if no cookie exists
  if (!session) {
    // This creates a completely new URL to ensure the browser doesn't use cache
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}