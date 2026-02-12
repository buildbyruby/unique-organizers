import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'unique-organizers-2026-secure-key'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const session = request.cookies.get('session')?.value

  // 1. Protect Admin Routes
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!session) return NextResponse.redirect(new URL('/admin/login', request.url))
    
    try {
      const { payload } = await jwtVerify(session, SECRET_KEY)
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 2. Protect User Dashboard
  if (path.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}