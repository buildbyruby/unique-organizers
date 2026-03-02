import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function GET() {
  try {
    const token = (await cookies()).get('auth_token')?.value
    if (!token) return NextResponse.json([], { status: 401 })

    const { payload } = await jwtVerify(token, SECRET)
    const userId = payload.userId as string

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Auth Failed' }, { status: 500 })
  }
}