import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const body = await request.json();
  
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      retailPrice: parseFloat(body.retailPrice),
      wholesalePrice: parseFloat(body.wholesalePrice),
      stock: parseInt(body.stock),
      images: body.images,
      colors: body.colors,
    }
  });
  return NextResponse.json(product);
}