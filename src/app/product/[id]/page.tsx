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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black gap-4">
      <Loader2 className="animate-spin text-purple-600" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Retrieving Asset...</p>
    </div>
  );

  const activePrice = pricingTier === 'retail' ? product.retailPrice : product.wholesalePrice;
  const liveTotal = activePrice * quantity;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-10 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT: DYNAMIC IMAGE GALLERY */}
        <div className="space-y-4 md:sticky md:top-28">
          <div 
            className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border-2 relative group shadow-xl transition-all duration-500"
            style={{ borderColor: selectedColor ? selectedColor : '#f1f5f9' }}
          >
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 text-slate-500 z-10 shadow-sm">
              {product.category.replace('_', ' ')}
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img: string, idx: number) => (
              <button 
                key={idx} onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-purple-600 scale-95 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: COMMERCE CONTROLS */}
        <div className="space-y-8 pt-4">
          <div>
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-black mb-6 text-xs font-black uppercase tracking-widest transition-colors">
              <ChevronLeft size={14} /> Back to Archive
            </button>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4 italic text-black">{product.name}</h1>
            <div className="flex items-center gap-4 text-purple-600">
              <div className="flex text-amber-400">
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] opacity-40 uppercase">Verified System Stock</span>
            </div>
          </div>

          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm space-y-8">
            
            {/* TIER SELECTION */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
              <button 
                onClick={() => setPricingTier('retail')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pricingTier === 'retail' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Retail
              </button>
              <button 
                onClick={() => setPricingTier('wholesale')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pricingTier === 'wholesale' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Wholesale
              </button>
            </div>

            {/* COLOR PRESETS */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Variant</span>
                <div className="flex gap-4">
                  {product.colors.map((color: string) => (
                    <button
                      key={color} onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-purple-600 scale-110 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check size={20} className={color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white' ? 'text-black' : 'text-white'} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY & TOTAL */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</span>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(pricingTier === 'wholesale' ? product.minWholesale : 1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-slate-400 hover:text-black"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 text-center font-black text-xl text-black">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all text-slate-400 hover:text-black"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {pricingTier === 'wholesale' && (
                  <div className="text-purple-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Info size={12}/> Min Order: {product.minWholesale}
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Live Total</span>
                <div className="text-4xl font-black text-black tracking-tighter italic">KSh {liveTotal.toLocaleString()}</div>
              </div>
            </div>

            {/* ACTION */}
            <button 
              onClick={() => addToCart(product, selectedColor, quantity, pricingTier)}
              className="w-full bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-black/10"
            >
              <ShoppingBag size={20} /> Initialize Acquisition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}