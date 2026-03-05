'use client'

import { useState, useEffect } from 'react'
import { upsertProduct } from '../../../actions'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Tag, CircleDollarSign, Upload, Box, Palette, Layers, Percent } from 'lucide-react'

// interface to handle the database category structure
interface Category {
  id: string;
  name: string;
  children: { id: string, name: string }[];
}

export default function NewProductPage() {
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  // This fetches the REAL categories from your database so Admin matches Storefront
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setDbCategories(data);
        if (data.length > 0) setSelectedParentId(data[0].id);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }
    load();
  }, []);

  const activeParent = dbCategories.find(c => c.id === selectedParentId);

  return (
    <div className="min-h-screen bg-[#020203] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/admin" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Sparkles className="text-purple-500" size={20} /> Unified Product Manager
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Deploying to Storefront Assets</p>
          </div>
        </div>

        {/* THE FIX: Wrapping the action to satisfy TypeScript's void requirement */}
        <form action={async (formData) => { await upsertProduct(formData); }} className="space-y-6" encType="multipart/form-data">
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

            {/* Pricing Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Tag size={10} /> Retail
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">KSh</span>
                  <input name="retailPrice" type="number" required placeholder="0" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-12 text-sm font-bold focus:border-white outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 pl-4 flex items-center gap-1">
                  <CircleDollarSign size={10} /> Wholesale
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/50 font-bold text-xs">KSh</span>
                  <input name="wholesalePrice" type="number" placeholder="0" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-12 text-sm font-bold focus:border-pink-500 outline-none text-pink-500" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500 pl-4 flex items-center gap-1">
                  <Percent size={10} /> Discount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 font-bold text-xs">KSh</span>
                  <input name="discountPrice" type="number" placeholder="0" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 pl-12 text-sm font-bold focus:border-emerald-500 outline-none text-emerald-500" />
                </div>
              </div>
            </div>

            {/* SYNCED Categorization Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Layers size={10} /> Main Category
                </label>
                <select 
                  name="parentCategory" 
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer appearance-none hover:border-purple-500 transition-all"
                >
                  {dbCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 pl-4 flex items-center gap-1">
                  <Sparkles size={10} /> Sub-Tag
                </label>
                <select 
                  name="categoryId" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none cursor-pointer appearance-none hover:border-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                >
                  {activeParent?.children.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory & Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Box size={10} /> Stock Count
                </label>
                <input name="stock" type="number" required defaultValue="0" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-white outline-none" />
              </div>
               <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                  <Palette size={10} /> Colors
                </label>
                <input name="colors" placeholder="Red, Blue, Green" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold focus:border-white outline-none" />
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-1">
                <Upload size={10} /> Cloudinary Asset Sync
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
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Product Media</p>
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