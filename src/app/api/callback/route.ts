import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = body.Body.stkCallback;

    if (result.ResultCode === 0) {
      // Payment Successful - Update DB
      const accountRef = result.CallbackMetadata.Item.find((i: any) => i.Name === 'ExternalReference')?.Value;
      
      await prisma.order.update({
        where: { accountReference: accountRef },
        data: { 
          paymentStatus: 'SUCCESS',
          status: 'PROCESSING'
        }
      });
    }
    return NextResponse.json({ message: "Received" });
  } catch (error) {
    return NextResponse.json({ error: "Callback failed" }, { status: 500 });
  }
}