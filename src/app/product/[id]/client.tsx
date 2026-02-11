'use client';

import { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck, Star, Zap, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductClient({ product }: { product: any }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Price Logic (Simple Wholesale Switch)
  const isWholesale = quantity >= 5 && product.wholesalePrice > 0;
  const unitPrice = isWholesale ? product.wholesalePrice : product.retailPrice;
  const totalPrice = unitPrice * quantity;

  const handleWhatsAppOrder = async () => {
    setLoading(true);

    try {
      // 1. First, save the "Lead" to your database so you don't lose the data
      // We use a mock phone number here just to save the record. You'll get the real one on WhatsApp.
      await fetch('/api/orders/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          amount: totalPrice,
          color: selectedColor,
          productName: product.name
        }),
      });

      // 2. Construct the WhatsApp Message
      const message = `*NEW ORDER REQUEST* %0A%0A` +
        `Hi Unique Organizers,%0A` +
        `I would like to purchase:%0A` +
        `📦 *${product.name}* %0A` +
        `🎨 Color: ${selectedColor} %0A` +
        `🔢 Quantity: ${quantity} %0A` +
        `💰 Total: KSh ${totalPrice.toLocaleString()} %0A%0A` +
        `Please confirm availability and payment details.`;

      // 3. Open WhatsApp (Change the number below to your client's number)
      // Format: 2547XXXXXXXX (No +)
      const phoneNumber = "254797517565"; 
      const url = `https://wa.me/${phoneNumber}?text=${message}`;

      window.open(url, '_blank');
      
      // Optional: Redirect user to a "Thank you" page or back home
      // router.push('/');

    } catch (error) {
      console.error("Order Error", error);
      alert("System busy. Please try clicking again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/20">
        <Link href="/" className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Zap size={10} fill="currentColor" /> In Stock
            </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto pt-32 pb-20 px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="aspect-square bg-[#111] rounded-[3rem] overflow-hidden relative border border-white/5 group">
             <img 
               src={product.images[0]} 
               alt={product.name}
               className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
             />
             <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">System ID</p>
                <p className="text-sm font-mono font-bold text-white">{product.id.slice(0,8).toUpperCase()}</p>
             </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col justify-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
               <span className="text-purple-500 font-black uppercase tracking-[0.2em] text-xs border border-purple-500/20 px-3 py-1 rounded-lg">
                 {product.category}
               </span>
               {isWholesale && (
                 <span className="text-yellow-500 font-black uppercase tracking-[0.2em] text-xs border border-yellow-500/20 px-3 py-1 rounded-lg animate-pulse">
                   Wholesale Pricing Active
                 </span>
               )}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
              {product.name}
            </h1>
            
            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8 max-w-md">
              {product.description}
            </p>

            <div className="h-px w-full bg-white/10 my-8" />

            {/* Controls */}
            <div className="space-y-8">
                
                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">Select Finish</span>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map((c: string) => (
                                <button 
                                    key={c}
                                    onClick={() => setSelectedColor(c)}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedColor === c ? 'bg-white text-black scale-105' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity & Price */}
                <div className="flex items-end justify-between bg-[#111] p-6 rounded-3xl border border-white/5">
                    <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Quantity</span>
                         <div className="flex items-center gap-4 bg-black p-1 rounded-xl border border-white/10">
                             <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg">-</button>
                             <span className="w-8 text-center font-mono font-bold">{quantity}</span>
                             <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-lg">+</button>
                         </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Total Estimate</span>
                        <p className="text-3xl font-black tracking-tighter">KSh {totalPrice.toLocaleString()}</p>
                    </div>
                </div>

                {/* ACTION BUTTON */}
                <button 
                  onClick={handleWhatsAppOrder}
                  disabled={loading}
                  className="w-full bg-[#25D366] text-white hover:bg-[#20bd5a] py-6 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-[0_0_40px_rgba(37,211,102,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        "Connecting..."
                    ) : (
                        <>
                            <MessageCircle size={20} fill="currentColor" className="text-white" />
                            Order via WhatsApp
                        </>
                    )}
                </button>
                
                <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                    <ShieldCheck size={12} className="inline mr-1" />
                    Secure Direct Chat • Instant Response
                </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}