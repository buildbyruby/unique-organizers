"use client"

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingBag, Search, Check, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Fetches your products from the API
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

  if (!product) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="animate-spin text-purple-500" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Initializing Asset...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="aspect-square bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/10 relative group shadow-2xl">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              {product.category}
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-purple-500 scale-95' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="space-y-8">
          <div>
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 text-xs font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft size={14} /> Back to Archive
            </button>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 text-purple-400">
              <div className="flex text-yellow-500"><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /></div>
              <span className="text-[10px] font-black tracking-[0.2em] opacity-60 uppercase">Premium Kenyan Stock</span>
            </div>
          </div>

          <p className="text-lg text-gray-400 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Retail Price</span>
                <div className="text-4xl font-black text-white tracking-tighter italic">KSh {product.retailPrice.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Availability</span>
                <div className="text-emerald-500 font-bold uppercase tracking-wider text-[10px] flex items-center justify-end gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ready to Dispatch
                </div>
              </div>
            </div>

            {/* COLOR PICKER */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Select Variant</span>
                <div className="flex gap-4">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/10 hover:border-white/40'}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check size={20} className="text-white drop-shadow-lg" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => addToCart(product, selectedColor)}
                className="bg-white text-black h-16 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <ShoppingBag size={20} /> Add to Stash
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/search?q=${product.name} unique organizers kenya`, '_blank')}
                className="bg-black border border-white/10 text-white h-16 rounded-2xl font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Search size={20} /> Google It
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}