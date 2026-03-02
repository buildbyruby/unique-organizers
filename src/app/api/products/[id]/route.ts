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
  
  const normalizedImages = Array.isArray(body.images)
    ? body.images
    : [body.images ?? body.image ?? body.imageUrl].filter(Boolean);

  const images = normalizedImages.filter((url: unknown): url is string => typeof url === 'string' && url.length > 0);

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      retailPrice: parseFloat(body.retailPrice),
      wholesalePrice: parseFloat(body.wholesalePrice),
      stock: parseInt(body.stock),
      minWholesale: parseInt(body.minWholesale),
      images,
      colors: Array.isArray(body.colors) ? body.colors : [],
    }
  });
  return NextResponse.json(product);
}