import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi");

export async function GET() {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const [user, orders, wishlist, cart] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
      prisma.order.findMany({ 
        where: { userId }, 
        include: { items: { include: { product: true } } }, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.wishlist.findMany({ 
        where: { userId }, 
        include: { product: true }, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.cartItem.findMany({ 
        where: { userId }, 
        include: { product: true } 
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: { user, orders, wishlist, cart } 
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
