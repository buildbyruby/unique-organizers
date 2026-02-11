import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductClient from './client'; // We will create this next

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return notFound();

  return <ProductClient product={product} />;
}