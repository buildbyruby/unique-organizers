import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ⚡ NEW: Handle single image field from frontend
    if (!body.images && body.image) {
      body.images = body.image; // Convert single image field to images array
    }

    // SAFETY: Robust conversion to ensure images is ALWAYS a clean array of strings
    let imageArray: string[] = [];

    if (body.images) {
      if (Array.isArray(body.images)) {
        imageArray = body.images.filter((img: any) => typeof img === 'string' && img.length > 0);
      } else if (typeof body.images === 'string' && body.images.trim().length > 0) {
        imageArray = [body.images.trim()]; // single string becomes array
      }
    }

    // SANITIZATION: Strict numeric parsing to prevent UI "squeezing" from NaN errors
    const productData = {
      name: body.name?.trim() || "Untitled Product",
      description: body.description || "",
      retailPrice: parseFloat(body.retailPrice) || 0,
      wholesalePrice: parseFloat(body.wholesalePrice) || 0,
      category: body.category || "UNCAREGORIZED",
      stock: parseInt(body.stock) || 0,
      minWholesale: parseInt(body.minWholesale) || 1,
      images: imageArray,
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
    };

    if (body.id) {
      // Update existing product without overwriting previous images unless new ones are provided
      const existingProduct = await prisma.product.findUnique({ where: { id: body.id } });
      if (existingProduct) {
        productData.images = imageArray.length > 0 ? imageArray : existingProduct.images;
      }

      const updatedProduct = await prisma.product.update({
        where: { id: body.id },
        data: productData
      });
      return NextResponse.json(updatedProduct);
    }

    // Create new product
    const newProduct = await prisma.product.create({
      data: productData
    });
    return NextResponse.json(newProduct);

  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: 'Error processing product synchronization' }, { status: 500 });
  }
}