import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi");

export async function GET() {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify the JWT to get the User ID
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    // Fetch orders belonging to this specific user [cite: 6, 7]
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: { product: true } // Include product details for the UI [cite: 9, 10]
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}