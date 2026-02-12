import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose'; 

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // 1. Check if password matches
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // 2. Create a secure JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // 3. Set the cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      // Automatically true on Vercel, false on your MacBook
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}