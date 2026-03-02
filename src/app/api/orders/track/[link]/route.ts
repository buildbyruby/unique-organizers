import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { link: string } }
) {
  try {
    const { link } = params;

    // 1. Safety check for the parameter
    if (!link) {
      return NextResponse.json(
        { success: false, error: "Tracking node identifier is required" },
        { status: 400 }
      );
    }

    // 2. Query the database using the uniqueOrderLink
    const order = await prisma.order.findUnique({
      where: { 
        uniqueOrderLink: link 
      },
      include: {
        // We include the items and nested product details to display the asset summary
        items: {
          include: { 
            product: true 
          }
        },
        // Including basic user info just in case you need it for the UI later
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // 3. Handle expired or invalid links
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Transmission not found or link expired" },
        { status: 404 }
      );
    }

    // 4. Return the full order payload to the client
    return NextResponse.json(order);

  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during decryption" },
      { status: 500 }
    );
  }
}