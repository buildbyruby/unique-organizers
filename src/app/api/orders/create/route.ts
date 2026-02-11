import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantity, color, phone, amount } = body;

    // 1. Create the Order in the database
    // Note: For simplicity, we're using a hardcoded userId since the user is in hospital.
    // In a real app, you'd get this from the session.
    const order = await prisma.order.create({
      data: {
        userId: "clsh123456789", // Mock ID - create a user in your DB or seed one
        totalAmount: amount,
        phoneNumber: phone,
        accountReference: `ORDER-${Math.random().toString(36).toUpperCase().substring(7)}`,
        status: "PENDING",
        paymentStatus: "INITIATED",
        items: {
          create: {
            productId: productId,
            quantity: quantity,
            price: amount / quantity,
            color: color
          }
        }
      }
    });

    console.log("Order Created:", order.id);

    // 2. Here is where you would trigger your Daraja / M-Pesa STK Push logic
    // For the demo today, we return success so the UI shows the "Sent" alert.
    
    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error("STK PUSH ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}