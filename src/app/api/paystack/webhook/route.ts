import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const expectedHash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (signature !== expectedHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data?.reference;
      if (reference) {
        const order = await prisma.order.findFirst({
          where: { accountReference: reference },
        });

        if (order && order.paymentStatus !== "PAID") {
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
                  message: "Payment verified via Paystack webhook.",
                },
              ],
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
