import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/paystack";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi"
);

function buildFallbackEmail(phone?: string) {
  const digits = (phone || "").replace(/\D/g, "") || `guest${Date.now()}`;
  const normalized = digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
  return `${normalized}@uniqueorganizers.co.ke`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email, phone, clientName } = body;

    if (!phone || phone.trim().length < 9) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const receiptEmail =
      email && typeof email === "string" && email.trim().includes("@")
        ? email.trim()
        : buildFallbackEmail(phone);

    let userId: string | null = null;
    try {
      const token = (await cookies()).get("auth_token")?.value;
      if (token) {
        const { payload } = await jwtVerify(token, SECRET);
        if (payload.userId && payload.userId !== "ADMIN_BYPASS_2026") {
          userId = payload.userId as string;
        }
      }
    } catch {}

    const productIds = items.map((i: any) => i.productId || i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      const realProductId = item.productId || item.id;
      const product = dbProducts.find((p) => p.id === realProductId);
      if (!product) throw new Error(`Product not found: ${realProductId}`);

      const qty = Math.max(1, Number(item.quantity) || 1);
      const isWholesale = qty >= (product.minWholesale || 5) || item.pricingTier === "wholesale";
      const unitPrice = isWholesale
        ? product.wholesalePrice
        : product.isDiscounted && product.discountPrice
        ? product.discountPrice
        : product.retailPrice;

      totalAmount += unitPrice * qty;

      return {
        productId: product.id,
        quantity: qty,
        price: unitPrice,
        color: item.color || null,
        size: item.size && item.size !== "N/A" ? item.size : null,
      };
    });

    const reference = `UO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const trackingLink = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        userId,
        phoneNumber: phone.trim(),
        totalAmount,
        accountReference: reference,
        uniqueOrderLink: trackingLink,
        status: "PENDING",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        trackingTimeline: [
          {
            status: "PENDING",
            time: new Date().toISOString(),
            message: "Order initialized. Awaiting Paystack confirmation.",
          },
        ],
        items: {
          create: orderItemsData,
        },
      },
    });

    const originHeader = req.headers.get("origin");
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const appUrl =
      originHeader ||
      (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:5000";

    const callbackUrl = `${appUrl}/checkout/verify?reference=${reference}`;

    const paystack = await initializePaystackTransaction({
      email: receiptEmail,
      amountKes: totalAmount,
      reference,
      callbackUrl,
      metadata: {
        orderId: order.id,
        trackingLink,
        clientName: clientName || "Customer",
        phone: phone.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystack.authorization_url,
      reference,
      trackingLink,
    });
  } catch (error: any) {
    console.error("Paystack Init Error:", error);
    return NextResponse.json({ error: error.message || "Payment initialization failed" }, { status: 500 });
  }
}
