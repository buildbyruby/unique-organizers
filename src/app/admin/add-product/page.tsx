"use client"

import { useState } from 'react'
import { addProduct } from '@/app/actions'
import { Plus, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddProductPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...urls])
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await addProduct(formData);
      if (result.success) {
        setMessage({ type: 'success', text: "ASSET SUCCESSFULLY DEPLOYED TO NODE" })
        setPreviews([])
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setMessage({ type: 'error', text: result.message || "SYSTEM AUTHENTICATION ERROR" })
      }
    } catch (err) {
      setMessage({ type: 'error', text: "CRITICAL SYSTEM FAILURE DURING UPLOAD" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center justify-between mb-12">
          <Link href="/admin" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase tracking-[0.3em] italic text-purple-500">Inventory_Upload</h1>
          <div className="w-10" />
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visual_Assets</label>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10">
                  <img src={src} className="w-full h-full object-cover" alt="Preview" />
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-500/5 transition">
                <Plus size={24} className="text-gray-600" />
                <input type="file" name="images" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset_Name</label>
              <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Classification</label>
              {/* UPDATED DROPDOWN WITH GIFTS */}
              <select name="category" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-purple-500 outline-none appearance-none cursor-pointer">
                <option value="GIFTS">LUXURY GIFTS</option>
                <option value="ELECTRONICS">ELECTRONICS</option>
                <option value="KITCHEN">KITCHEN & DINING</option>
                <option value="HOME_LIVING">HOME & LIVING</option>
                <option value="CLOTHING">CLOTHING & APPAREL</option>
                <option value="BEAUTY">BEAUTY & PERSONAL CARE</option>
                <option value="GROCERY">GROCERY & FOOD</option>
                <option value="TOYS">TOYS & BABY</option>
                <option value="SPORTS">SPORTS & OUTDOORS</option>
                <option value="AUTOMOTIVE">AUTOMOTIVE ELITE</option>
                <option value="PETS">PET SUPPLIES</option>
                <option value="TOOLS">TOOLS & HARDWARE</option>
                <option value="OFFICE">OFFICE SUPPLIES</option>
                <option value="HEALTH">HEALTH & WELLNESS</option>
                <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                <option value="GARDEN">GARDEN & OUTDOOR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retail_Price (KSh)</label>
              <input name="retailPrice" type="number" required className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Stock_Quantity</label>
              <input name="stock" type="number" required defaultValue="20" className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-purple-500 outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">System_Description</label>
            <textarea name="description" rows={4} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-purple-500 outline-none resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Color_Variants (Hex)</label>
            <div className="flex gap-2">
              <input name="colors" placeholder="#000000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" />
              <input name="colors" placeholder="#FFFFFF" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" />
              <input name="colors" placeholder="#F3F4F6" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-purple-600 hover:text-white transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> SYNCING...</> : "DEPLOY ASSET"}
          </button>

        </form>
      </div>
    </div>
  )
}