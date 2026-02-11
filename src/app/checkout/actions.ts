'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function initiateOrder(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) throw new Error("Product not found")

  // Create the order in the database
  const order = await prisma.order.create({
    data: {
      userId: userId,
      totalAmount: product.retailPrice,
      accountReference: `UQ-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: 'PENDING',
      paymentStatus: 'CREATED',
      items: {
        create: {
          productId: product.id,
          quantity: 1,
          price: product.retailPrice
        }
      }
    }
  })

  // Redirect to a success or payment page
  redirect(`/checkout/success?ref=${order.accountReference}`)
}