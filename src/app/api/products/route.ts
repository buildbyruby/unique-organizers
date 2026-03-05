import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ 
    include: { category: true },
    orderBy: { createdAt: 'desc' } 
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.images && body.image) {
      body.images = body.image;
    }

    let imageArray: string[] = [];
    if (body.images) {
      if (Array.isArray(body.images)) {
        imageArray = body.images.filter((img: any) => typeof img === 'string' && img.length > 0);
      } else if (typeof body.images === 'string' && body.images.trim().length > 0) {
        imageArray = [body.images.trim()];
      }
    }

    const productData: any = {
      name: body.name?.trim() || "Untitled Product",
      description: body.description || "",
      retailPrice: parseFloat(body.retailPrice) || 0,
      wholesalePrice: parseFloat(body.wholesalePrice) || 0,
      categoryId: body.categoryId, // Saving the actual ID from the database
      stock: parseInt(body.stock) || 0,
      minWholesale: parseInt(body.minWholesale) || 1,
      images: imageArray,
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
    };

    if (body.id) {
      const updatedProduct = await prisma.product.update({
        where: { id: body.id },
        data: productData
      });
      return NextResponse.json(updatedProduct);
    }

    const newProduct = await prisma.product.create({
      data: productData
    });
    return NextResponse.json(newProduct);

  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: 'Error processing product synchronization' }, { status: 500 });
  }
}