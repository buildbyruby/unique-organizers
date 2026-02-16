"use client"

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingBag, Check, ChevronLeft, Loader2, Minus, Plus, Info } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  
  // Interactive States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [pricingTier, setPricingTier] = useState<'retail' | 'wholesale'>('retail');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id);
        if (found) {
          setProduct(found);
          if (found.colors?.length > 0) setSelectedColor(found.colors[0]);
        }
      });
  }, [id]);

  // Enforce Wholesale Minimums dynamically
  useEffect(() => {
    if (product) {
      if (pricingTier === 'wholesale' && quantity < product.minWholesale) {
        setQuantity(product.minWholesale);
      } else if (pricingTier === 'retail' && quantity < 1) {
        setQuantity(1);
      }
    }
  }, [pricingTier, product, quantity]);

  if (!product) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="animate-spin text-purple-500" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Retrieving Asset...</p>
    </div>
  );

  const activePrice = pricingTier === 'retail' ? product.retailPrice : product.wholesalePrice;
  const liveTotal = activePrice * quantity;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-10 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT: DYNAMIC IMAGE GALLERY - Fix: Sticky only on desktop to prevent mobile overlap */}
        <div className="space-y-4 md:sticky md:top-28">
          <div 
            className="aspect-square bg-white/5 rounded-[2.5rem] overflow-hidden border-2 relative group shadow-2xl transition-all duration-500"
            style={{ borderColor: selectedColor ? selectedColor : 'rgba(255,255,255,0.05)' }}
          >
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 z-10">
              {product.category}
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img: string, idx: number) => (
              <button 
                key={idx} onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-purple-500 scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: COMMERCE CONTROLS */}
        <div className="space-y-8 pt-4">
          <div>
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 text-xs font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft size={14} /> Directory
            </button>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4 italic text-white">{product.name}</h1>
            <div className="flex items-center gap-4 text-purple-400">
              <div className="flex text-yellow-500"><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /></div>
              <span className="text-[10px] font-black tracking-[0.2em] opacity-60 uppercase">Verified Stock</span>
            </div>
          </div>

          <p className="text-lg text-gray-400 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-8">
            
            {/* TIER SELECTION */}
            <div className="flex p-1 bg-black/40 rounded-2xl w-fit border border-white/5">
              <button 
                onClick={() => setPricingTier('retail')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pricingTier === 'retail' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Retail
              </button>
              <button 
                onClick={() => setPricingTier('wholesale')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pricingTier === 'wholesale' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                Wholesale
              </button>
            </div>

            {/* COLOR PRESETS (VISUAL) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Variant</span>
                <div className="flex gap-4">
                  {product.colors.map((color: string) => (
                    <button
                      key={color} onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 hover:border-white/40'}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check size={20} className={color.toLowerCase() === '#ffffff' ? 'text-black drop-shadow-lg' : 'text-white drop-shadow-lg'} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY & TOTAL */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quantity</span>
                <div className="flex items-center bg-black/50 border border-white/10 rounded-2xl p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(pricingTier === 'wholesale' ? product.minWholesale : 1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 text-center font-black text-xl">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {pricingTier === 'wholesale' && (
                  <div className="text-purple-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Info size={12}/> Min Order: {product.minWholesale}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Live Total</span>
                <div className="text-4xl font-black text-white tracking-tighter italic">KSh {liveTotal.toLocaleString()}</div>
              </div>
            </div>

            {/* ACTION */}
            <button 
              onClick={() => addToCart(product, selectedColor, quantity, pricingTier)}
              className="w-full bg-white text-black h-16 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <ShoppingBag size={20} /> Initialize Acquisition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}