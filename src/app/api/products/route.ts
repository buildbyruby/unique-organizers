import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        retailPrice: parseFloat(body.retailPrice),
        wholesalePrice: parseFloat(body.wholesalePrice),
        category: body.category,
        stock: parseInt(body.stock),
        minWholesale: parseInt(body.minWholesale),
        images: body.images, // Expecting an array of strings
        colors: body.colors, // Expecting an array of hex codes
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}