import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * UNIQUE ORGANIZERS - API TRACKING ROUTE (v16.0)
 * Path: src/app/api/orders/track/[link]/route.ts
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ link: string }> } // NEXT.js 16 REQUIREMENT: MUST BE A PROMISE
) {
  try {
    // 1. You MUST await the params before accessing properties
    const resolvedParams = await params;
    const link = resolvedParams.link;

    if (!link) {
      return NextResponse.json(
        { success: false, error: "Missing tracking link" },
        { status: 400 }
      );
    }

    // 2. Fetch order data
    const order = await prisma.order.findUnique({
      where: { uniqueOrderLink: link },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });

  } catch (error) {
    console.error("API_TRACK_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}