import { createProduct } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, Tag, CircleDollarSign } from 'lucide-react'

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/admin" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Sparkles className="text-purple-500" size={20} /> Add New Inventory
            </h1>
          </div>
        </div>

        <form action={createProduct} className="space-y-6">
          <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Product Name</label>
              <input name="name" required className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-purple-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Description</label>
              <textarea name="description" required rows={3} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-purple-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Tag size={10} /> Retail Price
                </label>
                <input name="retailPrice" type="number" required className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 pl-4 flex items-center gap-1">
                  <CircleDollarSign size={10} /> Wholesale Price
                </label>
                <input name="wholesalePrice" type="number" required className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-pink-500 outline-none text-pink-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Image URL</label>
              <input name="imageUrl" required className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-purple-400 outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Category</label>
              <select name="category" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none">
                <option value="ELECTRONICS">Electronics</option>
                <option value="FURNITURE">Furniture</option>
                <option value="DECOR">Decor</option>
                <option value="KITCHEN">Kitchen</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-purple-600 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-purple-500/10">
            Push to Production
          </button>
        </form>
      </div>
    </div>
  )
}