import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = body.Body.stkCallback;

    // CheckoutRequestID connects the Safaricom response to our Order
    const checkoutRequestID = result.CheckoutRequestID;
    const resultCode = result.ResultCode; // 0 means Success

    if (resultCode === 0) {
      // Payment Successful
      // Using updateMany to bypass strict unique property requirements in TypeScript/Prisma
      await prisma.order.updateMany({
        where: { 
          // @ts-ignore
          checkoutRequestID: checkoutRequestID 
        },
        data: {
          paymentStatus: 'SUCCESS',
          status: 'PROCESSING', // Move to processing stage
        }
      });
      console.log(`✅ Payment Success for ID: ${checkoutRequestID}`);
    } else {
      // Payment Failed or Cancelled
      await prisma.order.updateMany({
        where: { 
          // @ts-ignore
          checkoutRequestID: checkoutRequestID 
        },
        data: { paymentStatus: 'FAILED' }
      });
      console.log(`❌ Payment Failed for ID: ${checkoutRequestID}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
}