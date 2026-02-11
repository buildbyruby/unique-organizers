import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, quantity, totalAmount, phoneNumber, accountReference, color } = body

    // 1. Ensure numeric values (Prisma 'Float' and 'Int' require actual numbers)
    const amount = parseFloat(totalAmount) || 0
    const qty = parseInt(quantity) || 1

    // 2. Create the order
    const order = await prisma.order.create({
      data: {
        // Since userId is optional in your schema, we can simply omit it for guests
        accountReference: accountReference || `REC-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        phoneNumber: phoneNumber || "0000000000",
        totalAmount: amount,
        status: 'PENDING',
        paymentStatus: 'INITIATED',
        items: {
          create: {
            productId: productId,
            quantity: qty,
            price: amount,
            color: color || null,
          }
        }
      }
    })

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 })

  } catch (error: any) {
    console.error('Record Order Error:', error)
    // Handle unique constraint errors (e.g., accountReference)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Reference ID already exists." }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}