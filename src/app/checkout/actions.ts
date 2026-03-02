'use server'

import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'

export async function initiateOrder(items: any[], userId: string, phone: string, total: number) {
  try {
    // Generate Secure Unique Order Link
    const orderLink = `ORD-${nanoid(10).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        userId: userId,
        phoneNumber: phone,
        totalAmount: total,
        accountReference: `UQ-${Math.random().toString(36).substring(7).toUpperCase()}`,
        uniqueOrderLink: orderLink,
        status: 'PENDING',
        deliveryStatus: 'PENDING',
        trackingTimeline: [
          { status: 'PENDING', time: new Date().toISOString(), note: "Order Synchronized" }
        ],
        items: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.retailPrice,
            color: item.selectedColor,
            size: item.selectedSize
          }))
        }
      }
    })

    // Track Conversion
    await prisma.analytics.create({
      data: {
        eventType: 'PURCHASE',
        metadata: { orderId: order.id, amount: total }
      }
    })

    redirect(`/checkout/success?ref=${order.uniqueOrderLink}`)
  } catch (error) {
    console.error("Order Failure:", error)
    throw new Error("System failed to generate transaction.")
  }
}