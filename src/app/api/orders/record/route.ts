import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, quantity, totalAmount, phoneNumber, accountReference } = body

    // 1. Validate numbers (Prisma expects Floats/Ints, not strings)
    const amount = parseFloat(totalAmount) || 0
    const qty = parseInt(quantity) || 1

    // 2. Create the order
    // Since userId is optional in your schema (User?), 
    // we simply don't pass it for guest checkouts.
    const order = await prisma.order.create({
      data: {
        totalAmount: amount,
        phoneNumber: phoneNumber || "0000000000",
        accountReference: accountReference || `ORD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        status: 'PENDING',
        paymentStatus: 'INITIATED',
        items: {
          create: {
            productId: productId,
            quantity: qty,
            price: amount,
          }
        }
      }
    })

    return NextResponse.json({ success: true, orderId: order.id })

  } catch (error: any) {
    console.error('Order Recording Error:', error)
    return NextResponse.json(
      { error: error.message || "Failed to record order" }, 
      { status: 500 }
    )
  }
}