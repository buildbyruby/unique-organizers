import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * UNIQUE ORGANIZERS - ORDER TRACKING ENGINE
 * Location: src/app/orders/track/[link]/route.ts
 * Next.js 16 Compliance: Params must be awaited as a Promise.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ link: string }> } // Type definition for the Promise
) {
  try {
    // 1. Await the params to extract the unique link
    const resolvedParams = await params;
    const link = resolvedParams.link;

    // 2. Database lookup
    const order = await prisma.order.findUnique({
      where: { 
        uniqueOrderLink: link 
      },
      include: {
        items: {
          include: { 
            product: true 
          }
        },
        // Including user for UI context if needed
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // 3. Error Handling
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or tracking link expired" }, 
        { status: 404 }
      );
    }

    // 4. Success Response
    return NextResponse.json(order);

  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}