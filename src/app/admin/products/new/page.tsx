import { createProduct } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Tag, CircleDollarSign, Upload, Box, Palette, Layers } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
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

        {/* Form with improved spacing and non-squeezed inputs */}
        <form action={createProduct} className="space-y-6" encType="multipart/form-data">
          <div className="bg-[#0a0a0c] border border-white/5 p-6 md:p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
            
            {/* Basic Info */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Product Name</label>
              <input name="name" required placeholder="Ex: Premium Leather Sofa" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-purple-500 outline-none transition-all" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Description</label>
              <textarea name="description" required rows={4} placeholder="Tell the customers about this item..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-purple-500 transition-all" />
            </div>

            {/* Pricing Section - Expanded for better visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Tag size={10} /> Retail Price
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">KSh</span>
                  <input name="retailPrice" type="number" required placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-14 text-sm font-bold focus:border-white outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 pl-4 flex items-center gap-1">
                  <CircleDollarSign size={10} /> Wholesale Price
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500/50 font-bold text-xs">KSh</span>
                  <input name="wholesalePrice" type="number" placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-14 text-sm font-bold focus:border-pink-500 outline-none text-pink-500" />
                </div>
              </div>
            </div>

            {/* Inventory Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Box size={10} /> Stock Count
                </label>
                <input name="stock" type="number" required defaultValue="0" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Layers size={10} /> Category
                </label>
                <select name="category" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer appearance-none hover:border-purple-500 transition-all">
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="DECOR">Decor</option>
                  <option value="KITCHEN">Kitchen</option>
                </select>
              </div>
            </div>

            {/* Product Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Palette size={10} /> Colors (Comma separated)
                </label>
                <input name="colors" placeholder="Red, Blue, Green" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-white outline-none" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Sizes (Comma separated)</label>
                <input name="sizes" placeholder="Small, Large, XL" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-white outline-none" />
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                <Upload size={10} /> Upload Images
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  name="images" 
                  multiple 
                  accept="image/*"
                  className="w-full bg-black/40 border-2 border-dashed border-white/10 rounded-[2rem] p-16 text-xs font-mono text-purple-400 outline-none cursor-pointer file:hidden hover:border-purple-500 transition-all" 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-500 group-hover:text-purple-400">
                   <Upload size={32} className="mb-3" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Drop files or click to browse</p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-white text-black py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-purple-600 hover:text-white transition-all transform active:scale-[0.98] shadow-2xl shadow-purple-500/20">
            Push to Production
          </button>
        </form>
      </div>
    </div>
  )
}