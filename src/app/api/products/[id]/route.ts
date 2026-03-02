import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "unique-organizers_secure_access_node_2026_nairobi";
const key = new TextEncoder().encode(secretKey);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const product = await prisma.product.findUnique({ where: { id } });
  return NextResponse.json(product);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const body = await request.json();
  
  // SAFETY: Ensure images is an array before sending to Prisma to prevent blank displays
  let imageArray: string[] = [];
  if (Array.isArray(body.images)) {
    imageArray = body.images;
  } else if (typeof body.images === 'string') {
    imageArray = body.images.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "");
  } else {
    // Fallback to existing images if none provided in the update
    const existing = await prisma.product.findUnique({ where: { id }, select: { images: true } });
    imageArray = (existing?.images as string[]) || [];
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      retailPrice: parseFloat(body.retailPrice),
      wholesalePrice: parseFloat(body.wholesalePrice),
      stock: parseInt(body.stock),
      images: imageArray,
      colors: body.colors || [],
    }
  });
  return NextResponse.json(product);
}

// TOGGLE WISHLIST
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const productId = (await params).id;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, key);
    const userId = payload.userId as string;

    const existing = await prisma.wishlist.findUnique({
      where: { 
        userId_productId: { 
          userId: userId, 
          productId: productId 
        } 
      }
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { 
          userId_productId: { 
            userId: userId, 
            productId: productId 
          } 
        }
      });
      return NextResponse.json({ active: false, message: "Removed from wishlist" });
    } else {
      await prisma.wishlist.create({
        data: { 
          userId: userId, 
          productId: productId 
        }
      });
      return NextResponse.json({ active: true, message: "Added to wishlist" });
    }
  } catch (error: any) {
    console.error("Wishlist Toggle Error:", error);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}