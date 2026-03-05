import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export default async function TestDBPage() {
  try {
    const targetCategoryId = "BEAUTY_HAIR";

    // 1. Ensure the Category exists first
    await prisma.category.upsert({
      where: { id: targetCategoryId },
      update: {}, // If it exists, do nothing
      create: {
        id: targetCategoryId,
        name: "Beauty & Hair",
      },
    });

    // 2. Now the Product can be safely created/updated
    const newProduct = await prisma.product.upsert({
      where: { id: "test-1" },
      update: {},
      create: {
        id: "test-1",
        name: "Luxe Silk Hair Wrap",
        categoryId: targetCategoryId,
        description: "Premium Kenyan-made silk wrap.",
        retailPrice: 1500,
        wholesalePrice: 1100,
        minWholesale: 5,
        stock: 50,
        images: ["https://images.unsplash.com/photo-1618330834871-dd22c2c226ca"],
      },
    });

    return (
      <div className="p-10 bg-black min-h-screen text-white">
        <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-[2rem] border border-green-500/30 shadow-2xl shadow-green-500/10">
          <h1 className="text-3xl font-black italic uppercase text-green-500 mb-6">Database Synced ✅</h1>
          <div className="space-y-4 font-mono text-sm">
            <p className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">CATEGORY:</span>
              <span>{targetCategoryId}</span>
            </p>
            <p className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">PRODUCT:</span>
              <span>{newProduct.name}</span>
            </p>
            <p className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-green-400">LIVE & LINKED</span>
            </p>
          </div>
          <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest text-center">
            Verification complete. You can now view this in your Supabase dashboard.
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="p-10 bg-black min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 p-8 rounded-3xl max-w-xl">
          <h1 className="text-xl font-black text-red-500 uppercase mb-4">Integrity Violation</h1>
          <pre className="text-[10px] text-red-300 overflow-auto bg-black/40 p-4 rounded-xl">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}