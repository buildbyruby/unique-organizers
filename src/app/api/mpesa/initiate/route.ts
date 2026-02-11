import { NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId, phone } = await req.json();

    // 1. Fetch the Order to get the amount
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Format Phone (254...)
    const formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;

    // 3. M-Pesa Auth Credentials
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(
      process.env.MPESA_SHORTCODE! + process.env.MPESA_PASSKEY! + timestamp
    ).toString('base64');

    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    });
    const { access_token } = await tokenResponse.json();

    // 4. Create the Payment record in your DB
    // We set status to INITIATED as per your Enum
    const payment = await prisma.payment.create({
      data: {
        amount: order.totalAmount,
        phoneNumber: formattedPhone,
        status: PaymentStatus.INITIATED,
        checkoutId: "PENDING_ID_" + Date.now(), // Temporary until Safaricom responds
        auditLog: [`Payment initiated at ${new Date().toISOString()}`],
        order: { connect: { id: orderId } }
      }
    });

    // 5. Trigger STK Push
    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(order.totalAmount), // Safaricom expects whole numbers or 2 decimals
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: order.id.slice(0, 12), // Max 12 chars for M-Pesa
        TransactionDesc: `Pay for Order ${order.id}`
      }),
    });

    const stkData = await stkResponse.json();

    // 6. Update Payment with the real CheckoutRequestID from Safaricom
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        checkoutId: stkData.CheckoutRequestID,
        status: PaymentStatus.AWAITING_USER_ACTION,
        auditLog: { push: `STK Push sent. CheckoutID: ${stkData.CheckoutRequestID}` }
      }
    });

    return NextResponse.json({ success: true, checkoutId: stkData.CheckoutRequestID });

  } catch (error) {
    console.error("Payment Initiation Error:", error);
    return NextResponse.json({ error: "Failed to start payment process" }, { status: 500 });
  }
}