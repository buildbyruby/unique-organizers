import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get ALL categories first
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    // Separate parents
    const parentCategories = allCategories.filter(cat => cat.parentId === null);

    // Attach children manually
    const structured = parentCategories.map(parent => ({
      ...parent,
      children: allCategories
        .filter(child => child.parentId === parent.id)
        .sort((a, b) => a.name.localeCompare(b.name))
    }));

    return NextResponse.json(structured);

  } catch (error) {
    console.error("CATEGORY FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}