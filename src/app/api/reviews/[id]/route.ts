import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Review purged from system' });
  } catch (error) {
    console.error('Purge error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}