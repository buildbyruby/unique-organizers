"use client"

import { useState } from 'react'
import { addProduct } from '@/app/actions'
import { 
  Plus, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function AddProductPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Handles showing the images on the screen immediately after picking them on a phone
  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const previews = filesArray.map(file => URL.createObjectURL(file))
      setPreviewImages(prev => [...prev, ...previews])
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    const result = await addProduct(formData)
    
    if (result.success) {
      setMessage({ type: 'success', text: "Asset successfully synchronized to the grid." })
      // Optional: clear form or redirect
    } else {
      setMessage({ type: 'error', text: result.message || "System error during upload." })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/admin" className="p-2 hover:bg-white/5 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase tracking-[0.3em] italic">New <span className="text-purple-500">Inventory</span></h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <form action={handleSubmit} className="space-y-8">
          
          {/* IMAGE UPLOAD BOX */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visual Assets (Multi-Upload)</label>
            <div className="grid grid-cols-3 gap-4">
              {previewImages.map((src, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative">
                  <img src={src} className="w-full h-full object-cover" alt="Preview" />
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                <Plus size={24} className="text-gray-500" />
                <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-600">Add Photo</span>
                <input 
                  type="file" 
                  name="images" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImagePreview} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* MAIN INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Name</label>
              <input 
                name="name" 
                required 
                placeholder="E.G. TITAN SERIES DESK"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
              <select name="category" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 appearance-none">
                <option value="ELECTRONICS">ELECTRONICS</option>
                <option value="FURNITURE">FURNITURE</option>
                <option value="CAR_EQUIPMENT">CAR EQUIPMENT</option>
                <option value="BEAUTY_HAIR">BEAUTY & HAIR</option>
                <option value="KITCHEN">KITCHEN</option>
              </select>
            </div>
          </div>

          {/* PRICING */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retail Price (KSh)</label>
              <input 
                name="retailPrice" 
                type="number" 
                required 
                placeholder="5500"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Wholesale Price</label>
              <input 
                name="wholesalePrice" 
                type="number" 
                placeholder="4200"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Description</label>
            <textarea 
              name="description" 
              rows={4} 
              required
              placeholder="ENTER TECHNICAL SPECIFICATIONS..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* COLOR SELECTOR (Simple Text Inputs for Phone) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Available Colors (Hex Codes)</label>
            <div className="flex gap-2">
              <input name="colors" placeholder="#000000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <input name="colors" placeholder="#FFFFFF" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <input name="colors" placeholder="#7C3AED" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" />
            </div>
          </div>

          {/* STATUS MESSAGES */}
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-purple-600 hover:text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading to Grid...
              </>
            ) : (
              "Deploy Asset"
            )}
          </button>

        </form>
      </div>
    </div>
  )
}