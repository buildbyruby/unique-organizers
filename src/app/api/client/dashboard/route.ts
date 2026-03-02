import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from '@/lib/prisma';

const secretKey = process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi";
const key = new TextEncoder().encode(secretKey);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let userId: string;
    try {
      const { payload } = await jwtVerify(token, key);
      userId = payload.userId as string;
    } catch (err) {
      return NextResponse.json({ error: "Session Expired" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch orders and wishlist with proper includes
    const [orders, wishlist] = await Promise.all([
      prisma.order.findMany({
        where: { userId: userId },
        include: { 
          items: { 
            include: { 
              product: true 
            } 
          } 
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wishlist.findMany({
        where: { userId: userId },
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              retailPrice: true,
              images: true,
              category: true
            }
          } 
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return NextResponse.json({
      data: {
        user,
        orders: orders || [],
        wishlist: wishlist || []
      }
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}