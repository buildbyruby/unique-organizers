import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantity, amount, color } = body;

    // Use 'connectOrCreate' or simply remove the hardcoded ID logic.
    // If your schema allows, we'll create the order without a linked user 
    // or link it to a generic 'Guest' account.
    
    const order = await prisma.order.create({
      data: {
        // We remove the hardcoded userId and let it be null if your schema allows,
        // OR we create it without the relation for now to unblock the flow.
        totalAmount: amount,
        phoneNumber: "WHATSAPP_LEAD",
        accountReference: `WA-${Math.random().toString(36).substring(7).toUpperCase()}`,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead Record Error:", error);
    // Even if the database record fails, we want the WhatsApp window to open!
    return NextResponse.json({ success: false }, { status: 500 });
  }
}