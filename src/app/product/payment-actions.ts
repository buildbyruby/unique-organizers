"use server"

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * PRODUCTION-READY: Creates a manual Paybill order.
 * This skips Safaricom API calls and prepares the database for manual verification.
 */
export async function createPaybillOrder(userId: string, productId: string, amount: number) {
  // Generate a unique 4-character ID for the Account Reference
  const shortRef = Math.random().toString(36).substring(2, 6).toUpperCase();
  const accountRef = `UO-${shortRef}`;

  try {
    // 1. Fetch product to ensure it exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    // 2. Create the Payment & Order in a single Transaction
    // This ensures either both are created, or neither is (prevents ghost orders)
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          amount: amount,
          phoneNumber: "MANUAL_ENTRY",
          status: 'INITIATED',
          method: 'MPESA_PAYBILL',
          checkoutId: `MANUAL-${accountRef}` // Placeholder to satisfy old constraints
        }
      });

      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: amount,
          accountReference: accountRef,
          paymentStatus: 'INITIATED',
          paymentId: payment.id,
          items: {
            create: {
              productId: productId,
              quantity: 1,
              pricePaid: amount,
            }
          }
        }
      });

      return { order, accountRef };
    });

    console.log(`[SUCCESS] Order Created: ${result.accountRef}`);

    return { 
      success: true, 
      accountRef: result.accountRef, 
      orderId: result.order.id 
    };

  } catch (error) {
    console.error("CRITICAL ERROR in createPaybillOrder:", error);
    return { success: false, message: "Could not process order. Database error." };
  }
}