"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Minus, 
  Plus, 
  Globe,
  Tag,
  CheckCircle2
} from 'lucide-react'

export default function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1)
  const [pricingMode, setPricingMode] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL')
  const [loading, setLoading] = useState(false)

  // Safe Color Selection
  const [selectedColor, setSelectedColor] = useState(
    product?.colors && product.colors.length > 0 ? product.colors[0] : "Standard"
  )

  // --- PRICING ENGINE ---
  const retailPrice = Number(product?.retailPrice) || 0
  const dbWholesalePrice = Number(product?.wholesalePrice) || 0
  
  // Logic: 50% discount if DB wholesale price is missing/zero
  const actualWholesalePrice = dbWholesalePrice > 0 
    ? dbWholesalePrice 
    : Math.round(retailPrice * 0.5)

  // Determine if wholesale is active (manual toggle OR quantity threshold)
  const isWholesaleActive = pricingMode === 'WHOLESALE' || quantity >= 5
  const unitPrice = isWholesaleActive ? actualWholesalePrice : retailPrice
  const totalCost = unitPrice * quantity
  const savings = (retailPrice - actualWholesalePrice) * quantity

  // Handle Mode Switching
  const handleModeSwitch = (mode: 'RETAIL' | 'WHOLESALE') => {
    setPricingMode(mode)
    if (mode === 'WHOLESALE' && quantity < 5) {
      setQuantity(5) // Auto-bump to bulk minimum
    }
    if (mode === 'RETAIL' && quantity >= 5) {
      setQuantity(1) // Reset to single unit if moving back to retail
    }
  }

  const handleAcquisition = async () => {
    setLoading(true)
    const phone = window.prompt("Enter M-Pesa Number (2547XXXXXXXX):")
    if (!phone) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          color: selectedColor,
          phone,
          amount: totalCost
        })
      })

      if(response.ok) {
        alert("STK Push Sent! Check your phone for the M-Pesa prompt.")
      } else {
        alert("Payment initialization failed. Please try again.")
      }
    } catch (error) {
      console.error("Order Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="p-8 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition">
          <ArrowLeft size={16} /> Return to Archives
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black text-purple-500 uppercase tracking-widest">
          <Globe size={12} className="animate-spin" style={{ animationDuration: '8s' }} /> System Node Active
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 py-12">
        
        {/* --- PRODUCT VISUAL --- */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
            <img 
              src={product.images?.[0] || "/api/placeholder/800/1000"} 
              alt={product.name} 
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* --- DETAILS & LOGIC --- */}
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">
              Catalog // {product.category || "General"}
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
              {product.name}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">
              {product.description}
            </p>
          </div>

          {/* --- PRICING STRATEGY SELECTOR --- */}
          <div className="mb-10">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Select Acquisition Strategy</p>
            <div className="grid grid-cols-2 gap-4">
              {/* Retail Toggle */}
              <button 
                onClick={() => handleModeSwitch('RETAIL')}
                className={`p-6 rounded-[2rem] border transition-all flex flex-col items-start gap-2 relative overflow-hidden ${!isWholesaleActive ? 'border-white bg-white/5' : 'border-white/5 bg-transparent opacity-40 hover:opacity-60'}`}
              >
                <div className="flex justify-between w-full items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Retail</span>
                  {!isWholesaleActive && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <p className="text-2xl font-black italic">KSh {retailPrice.toLocaleString()}</p>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Single Asset Purchase</span>
              </button>

              {/* Wholesale Toggle */}
              <button 
                onClick={() => handleModeSwitch('WHOLESALE')}
                className={`p-6 rounded-[2rem] border transition-all flex flex-col items-start gap-2 relative overflow-hidden ${isWholesaleActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-transparent opacity-40 hover:opacity-60'}`}
              >
                <div className="flex justify-between w-full items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Wholesale</span>
                  {isWholesaleActive && <CheckCircle2 size={16} className="text-purple-400" />}
                </div>
                <p className="text-2xl font-black italic text-purple-100">KSh {actualWholesalePrice.toLocaleString()}</p>
                <span className="text-[9px] font-bold text-purple-500/60 uppercase tracking-tighter">Bulk Archive (5+ Units)</span>
              </button>
            </div>
          </div>

          {/* --- CONTROLS --- */}
          <div className="space-y-10 mb-12">
            {/* Color Selector */}
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Select Variant</p>
              <div className="flex flex-wrap gap-3">
                {product.colors?.map((color: string) => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedColor === color
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {color}
                  </button>
                )) || <span className="text-gray-500 text-[10px]">Standard Edition</span>}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Quantity Required</p>
              <div className="flex items-center gap-6 bg-white/5 w-max rounded-2xl px-6 py-3 border border-white/5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-purple-500 transition-colors">
                  <Minus size={16}/>
                </button>
                <span className="text-xl font-black italic w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="hover:text-purple-500 transition-colors">
                  <Plus size={16}/>
                </button>
              </div>
              {isWholesaleActive && (
                <p className="mt-3 text-[10px] text-green-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Tag size={12} /> Bulk Pricing Applied
                </p>
              )}
            </div>
          </div>

          {/* --- ACTION BUTTON --- */}
          <div className="space-y-4">
            <button 
              onClick={handleAcquisition}
              disabled={loading}
              className="group w-full h-24 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-between px-10 hover:bg-purple-600 hover:text-white transition-all transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <ShoppingCart size={20} className={loading ? "animate-bounce" : ""} />
                <span>{loading ? "Initializing..." : "Secure Acquisition"}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] opacity-60 uppercase font-black block">Total Payable</span>
                <span className="text-xl italic">KSh {totalCost.toLocaleString()}</span>
                {isWholesaleActive && savings > 0 && (
                  <span className="block text-[9px] text-green-600 font-black">Saved KSh {savings.toLocaleString()}</span>
                )}
              </div>
            </button>

            <div className="flex justify-between items-center px-4 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-purple-500" /> Secure Payment via Daraja
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                 <Zap size={14} className="text-yellow-500" /> Instant Processing
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}