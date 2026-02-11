'use server'

import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  
  // Safely parse numbers. If invalid or missing, default to 0.
  const retailPriceRaw = formData.get('retailPrice')
  const retailPrice = retailPriceRaw ? parseFloat(retailPriceRaw as string) : 0
  
  const wholesalePriceRaw = formData.get('wholesalePrice')
  const wholesalePrice = wholesalePriceRaw ? parseFloat(wholesalePriceRaw as string) : 0

  const category = formData.get('category') as string
  const imageUrl = formData.get('imageUrl') as string

  await prisma.product.create({
    data: {
      name,
      description,
      retailPrice,
      wholesalePrice,
      category,
      images: imageUrl ? [imageUrl] : [], // Prevents empty string in array if no image
      // inStock: true,  <-- REMOVED: This field does not exist in your schema
    }
  })

  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}