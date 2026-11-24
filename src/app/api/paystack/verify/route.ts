import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const txData = await verifyPaystackTransaction(reference);

    const order = await prisma.order.findFirst({
      where: { accountReference: reference },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (txData.status === "success") {
      if (order.paymentStatus !== "PAID") {
        const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            trackingTimeline: [
              ...currentTimeline,
              {
                status: "CONFIRMED",
                time: new Date().toISOString(),
                message: `Payment confirmed via Paystack (${txData.channel || "online"}).`,
              },
            ],
          },
        });
      }

      return NextResponse.json({
        success: true,
        paid: true,
        trackingLink: order.uniqueOrderLink,
        amount: order.totalAmount,
      });
    }

    return NextResponse.json({
      success: false,
      paid: false,
      status: txData.status,
    });
  } catch (error: any) {
    console.error("Paystack Verify Error:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
