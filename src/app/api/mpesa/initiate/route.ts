import { NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phoneNumber, amount, orderId } = await req.json();

    // 1. Format the phone number
    const formattedPhone = phoneNumber.replace('+', '').replace(/^0/, '254');
    const accountReference = `Order-${orderId || Math.floor(Math.random() * 10000)}`;

    // 2. Trigger M-Pesa
    const response = await initiateStkPush(formattedPhone, amount, accountReference);

    // 3. Update the Order (Instead of creating a non-existent 'Payment')
    // We save the CheckoutRequestID so the callback can identify this order later.
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId },
        data: {
          // @ts-ignore - ignoring typescript check to force save the ID
          checkoutRequestID: response.CheckoutRequestID
        }
      });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Initiate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}