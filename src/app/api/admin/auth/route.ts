import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import this

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;
    
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
      // 1. Get the cookie store
      const cookieStore = await cookies();

      // 2. Set the cookie directly on the store
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 'lax' is safer for redirects than 'strict'
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      // 3. Return a standard response
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}