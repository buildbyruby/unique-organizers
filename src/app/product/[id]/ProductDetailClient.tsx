"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Minus, 
  Plus, 
  Globe,
  Tag,
  CheckCircle2,
  Heart,
  Loader2
} from 'lucide-react'

export default function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1)
  const [pricingMode, setPricingMode] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL')
  const [isWishlisting, setIsWishlisting] = useState(false)
  const [wishlistActive, setWishlistActive] = useState(false)
  const { addToCart } = useCart()

  // STRICT DATA INTEGRITY: Capturing Color
  const [selectedColor, setSelectedColor] = useState(
    product?.colors && product.colors.length > 0 ? product.colors[0] : "Standard"
  )

  // STRICT DATA INTEGRITY: Capturing Size
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : "N/A"
  )

  const retailPrice = Number(product?.retailPrice) || 0
  const dbWholesalePrice = Number(product?.wholesalePrice) || 0
  const actualWholesalePrice = dbWholesalePrice > 0 ? dbWholesalePrice : Math.round(retailPrice * 0.5)

  const isWholesaleActive = pricingMode === 'WHOLESALE' || quantity >= 5
  const unitPrice = isWholesaleActive ? actualWholesalePrice : retailPrice
  const totalCost = unitPrice * quantity

  const handleModeSwitch = (mode: 'RETAIL' | 'WHOLESALE') => {
    setPricingMode(mode)
    if (mode === 'WHOLESALE' && quantity < 5) setQuantity(5)
  }

  const handleAddToCart = () => {
    addToCart(
      product,
      selectedColor,
      quantity,
      isWholesaleActive ? 'wholesale' : 'retail',
      selectedSize
    );
  };

  /**
   * TOGGLE WISHLIST LOGIC
   * Synchronized with your /api/products/[id] POST route
   */
  const handleToggleWishlist = async () => {
    setIsWishlisting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, { 
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        // The API returns { active: true } or { active: false }
        setWishlistActive(data.active);
      } else if (res.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
      }
    } catch (error) {
      console.error("Wishlist Connection Error:", error);
    } finally {
      setIsWishlisting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* NAVIGATION TERMINAL */}
      <nav className="p-8 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition">
          <ArrowLeft size={16} /> Return to Archives
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-black text-purple-500 uppercase tracking-widest">
          <Globe size={12} className="animate-spin" /> System Node Active
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 py-12">
        {/* VISUAL ASSET DISPLAY */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-purple-600/20 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000" />
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 bg-black">
            <img 
              src={product.images?.[0] || 'https://placehold.co/600x800'} 
              alt={product.name} 
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700"
            />
            
            {/* WISHLIST TOGGLE BUTTON */}
            <button 
              onClick={handleToggleWishlist}
              disabled={isWishlisting}
              className="absolute top-8 right-8 w-14 h-14 bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white hover:text-black transition-all active:scale-90"
            >
              {isWishlisting ? (
                <Loader2 size={20} className="animate-spin text-purple-500" />
              ) : (
                <Heart 
                  size={20} 
                  className={`transition-colors ${wishlistActive ? "text-pink-500 fill-pink-500" : "text-white"}`} 
                />
              )}
            </button>
          </div>
        </div>

        {/* DATA & ACQUISITION PANEL */}
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block animate-pulse">
              Archive // {product.category || "General"}
            </span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
              {product.name}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              {product.description}
            </p>
          </div>

          {/* PRICING ARCHITECTURE */}
          <div className="mb-10 grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleModeSwitch('RETAIL')}
              className={`p-6 rounded-[2rem] border transition-all text-left group ${!isWholesaleActive ? 'border-white bg-white/5' : 'border-white/5 opacity-40 hover:opacity-100'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest">Retail Tier</span>
                {!isWholesaleActive && <CheckCircle2 size={16} className="text-white" />}
              </div>
              <p className="text-2xl font-black italic">KSh {retailPrice.toLocaleString()}</p>
            </button>

            <button 
              onClick={() => handleModeSwitch('WHOLESALE')}
              className={`p-6 rounded-[2rem] border transition-all text-left group ${isWholesaleActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 opacity-40 hover:opacity-100'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Wholesale Tier</span>
                {isWholesaleActive && <CheckCircle2 size={16} className="text-purple-400" />}
              </div>
              <p className="text-2xl font-black italic text-purple-500">KSh {actualWholesalePrice.toLocaleString()}</p>
              <span className="text-[8px] font-black uppercase opacity-60">Min. 5 Units</span>
            </button>
          </div>

          {/* CONFIGURATION VECTOR */}
          <div className="space-y-10 mb-12">
            {/* COLOR SELECTION */}
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                <Tag size={12} /> Color Variant
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors?.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      selectedColor === color 
                        ? 'bg-white text-black border-white' 
                        : 'border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTION */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Size Variant
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        selectedSize === size 
                          ? 'bg-white text-black border-white' 
                          : 'border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY CONTROL */}
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Quantity Vector</p>
              <div className="flex items-center gap-6 bg-white/5 w-max rounded-2xl px-6 py-3 border border-white/5">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xl font-black italic w-12 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* FINAL ACQUISITION ACTION */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              className="w-full h-24 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-between px-10 hover:bg-purple-600 hover:text-white transition-all transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <ShoppingCart size={20} />
                <span>Initialize Acquisition</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] opacity-60 uppercase font-black block">Total KSh</span>
                <span className="text-xl italic">{totalCost.toLocaleString()}</span>
              </div>
            </button>

            {/* TRUST INDICATORS */}
            <div className="flex justify-between items-center px-4 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-purple-500" /> Internal Logistics
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                 <Zap size={14} className="text-yellow-500" /> Marketplace Item
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}