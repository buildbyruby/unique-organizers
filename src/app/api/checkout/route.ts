import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { initiateStkPush } from '@/lib/mpesa'

export async function POST(req: Request) {
  try {
    const { productId, phoneNumber, userId } = await req.json()

    // 1. Fetch Product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 2. Create Order in Database
    const accountRef = `ORD-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
    
    const order = await prisma.order.create({
      data: {
        accountReference: accountRef,
        // If userId exists, we connect it to the User model
        // If not, we leave it undefined so Prisma doesn't complain
        ...(userId ? { user: { connect: { id: userId } } } : {}),
        
        phoneNumber: phoneNumber, // This was the missing required field!
        totalAmount: product.retailPrice,
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

    // 3. Trigger M-Pesa STK Push
    // Phone must be in format 2547XXXXXXXX
    const cleanPhone = phoneNumber.replace('+', '').replace(/^0/, '254')
    const mpesaResponse = await initiateStkPush(cleanPhone, product.retailPrice, accountRef)

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      checkoutRequestId: mpesaResponse?.CheckoutRequestID || 'N/A'
    })

  } catch (error: any) {
    console.error('Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}