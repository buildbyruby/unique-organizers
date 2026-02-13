import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this matches your prisma export path
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers-2026");

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    let userObj = null;
    let role = 'CUSTOMER';

    // 1. MASTER ADMIN CHECK
    const isAdminEmail = email === 'admin' || email === 'admin@unique.com';
    const isValidAdminPass = password === process.env.ADMIN_PASSWORD;

    if (isAdminEmail && isValidAdminPass) {
      userObj = { id: 'master-admin', email: 'admin@unique.com' };
      role = 'ADMIN';
    } else {
      // 2. DATABASE CHECK
      const dbUser = await prisma.user.findUnique({ where: { email } });
      
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, dbUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
      }
      
      userObj = { id: dbUser.id, email: dbUser.email };
      role = dbUser.role;
    }

    // 3. GENERATE TOKEN
    const token = await new SignJWT({ userId: userObj.id, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET);

    const response = NextResponse.json({ success: true, role });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}