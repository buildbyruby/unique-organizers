import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // move outside the component

export default async function TestDBPage() {
  try {
    const newProduct = await prisma.product.upsert({
      where: { id: "test-1" },
      update: {},
      create: {
        id: "test-1",
        name: "Luxe Silk Hair Wrap",
        category: "BEAUTY_HAIR",
        description: "Premium Kenyan-made silk wrap.",
        retailPrice: 1500,
        wholesalePrice: 1100,
        minWholesale: 5,
        stock: 50,
        images: ["https://images.unsplash.com/photo-1618330834871-dd22c2c226ca"],
      },
    });

    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-green-600">Database Connection Success!</h1>
        <p className="mt-4">Created/Verified Product: <strong>{newProduct.name}</strong></p>
        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
          Check your Supabase Table Editor now. ✨
        </p>
      </div>
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="p-10 text-red-500">
        <h1 className="text-xl font-bold">Database Error</h1>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-xs">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }
}
