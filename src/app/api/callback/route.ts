import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Depending on your payment provider, the reference might be in different fields.
    // We check common ones or fallback to the body itself if it's a string.
    const accountRef = body.account_reference || body.tracking_id || body.checkout_request_id || body.accountRef;

    if (!accountRef) {
      return NextResponse.json({ error: "No account reference found" }, { status: 400 });
    }

    console.log("Processing callback for ref:", accountRef);

    // FIX: Use findFirst instead of update directly
    // This bypasses the "Unique constraint" error you were seeing
    const existingOrder = await prisma.order.findFirst({
      where: { accountReference: accountRef }
    });

    if (!existingOrder) {
      console.error(`Order not found for ref: ${accountRef}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Now update using the ID (which IS unique)
    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: 'SUCCESS',
        status: 'CONFIRMED' // Changed from 'PROCESSING' to match your Prisma Enum
      }
    });

    return NextResponse.json({ success: true, orderId: updatedOrder.id });

  } catch (error) {
    console.error("Callback Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}