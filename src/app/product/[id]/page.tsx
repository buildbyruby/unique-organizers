"use client"
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, ChevronLeft, Loader2, Minus, Plus, 
  Heart, Tag, Landmark, MessageCircle, Star, ShieldCheck
} from 'lucide-react';
import { trackEngagement, toggleWishlist } from '@/app/actions';

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeMedia, setActiveMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const [syncing, setSyncing] = useState<'cart' | 'wishlist' | 'pay' | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Robust resolver for multi-format image data
  const resolveImages = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      if (data.startsWith('[')) {
        try { 
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [data];
        } catch { return [data]; }
      }
      return data.split(',').map(s => s.trim()).filter(s => s !== "");
    }
    return [];
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(found => {
        
        if (found) {
          setProduct(found);
          if (found.colors?.length > 0) setSelectedColor(found.colors[0]);
          if (found.sizes?.length > 0) setSelectedSize(found.sizes[0]);
          
          const images = resolveImages(found.images);
          // High-quality fallback if Cloudinary URL is missing
          const initialUrl = images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
          setActiveMedia({ type: 'image', url: initialUrl });
          trackEngagement(found.id, 'VISIT');
        }
      });
  }, [id]);

  if (!product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black gap-4">
      <Loader2 className="animate-spin text-purple-600" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing_Asset_Data...</p>
    </div>
  );

  const images = resolveImages(product.images);
  const isWholesaleEligible = quantity >= (product.minWholesale || 5);
  let unitPrice = product.retailPrice;
  if (isWholesaleEligible && product.wholesalePrice > 0) {
    unitPrice = product.wholesalePrice;
  } else if (product.isDiscounted && product.discountPrice) {
    unitPrice = product.discountPrice;
  }

  const liveTotal = unitPrice * quantity;

  const handlePaystackDirect = async () => {
    if (!customerPhone || customerPhone.trim().length < 9) {
      alert("Please enter your phone number to pay.");
      return;
    }
    setSyncing('pay');
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            productId: product.id,
            quantity,
            color: selectedColor,
            size: selectedSize,
            pricingTier: isWholesaleEligible ? "wholesale" : "retail",
          }],
          phone: customerPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorizationUrl) {
        alert(data.error || "Could not start payment.");
        setSyncing(null);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      alert("Payment connection failed.");
      setSyncing(null);
    }
  };

  const handleDeployToCart = async () => {
    setSyncing('cart');
    try {
      await addToCart(
        {...product, retailPrice: unitPrice}, 
        selectedColor, 
        quantity, 
        isWholesaleEligible ? 'wholesale' : 'retail',
        selectedSize
      );
    } catch (err) {
      alert("Cart Sync Error.");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-6 md:pt-16 pb-12 md:pb-24 px-4 md:px-12 font-sans overflow-x-hidden">
      {/* EXPANDED LAYOUT: Mobile padding reduced to px-4 */}
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 xl:gap-28 items-start">
        
        {/* MEDIA DISPLAY */}
        <div className="space-y-6 md:space-y-8 lg:sticky lg:top-28">
          <div className="aspect-square bg-white rounded-3xl md:rounded-[4rem] overflow-hidden border border-slate-100 relative shadow-2xl group transition-all duration-500 hover:shadow-purple-200/50 w-full">
            <div className="absolute top-4 left-4 md:top-10 md:left-10 z-10 flex flex-col gap-2 md:gap-4">
              {product.isDiscounted && !isWholesaleEligible && (
                <div className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.25em] shadow-lg">
                  Flash Sale
                </div>
              )}
              {isWholesaleEligible && (
                <div className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-[0.25em] shadow-lg animate-pulse">
                  Wholesale Active
                </div>
              )}
            </div>
            
            <img 
              src={activeMedia?.url} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt={product.name} 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=1000' }}
            />
          </div>

          <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 md:pb-6 no-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setActiveMedia({type: 'image', url: img})}
                className={`w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 transition-all ${activeMedia?.url === img ? 'border-purple-600 scale-90 ring-4 ring-purple-50' : 'border-white opacity-50 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="Gallery Item" />
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT & CONFIGURATION */}
        <div className="space-y-8 md:space-y-12 pt-2 md:pt-6">
          <div className="space-y-4 md:space-y-6">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 md:gap-3 text-slate-400 hover:text-purple-600 transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return_to_Inventory
            </button>
            {/* Text scales from 4xl on mobile to 7xl on desktop */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic text-black leading-[0.9]">{product.name}</h1>
            <div className="flex items-center gap-3 md:gap-5 text-purple-600">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400">Verified_System_Asset</span>
            </div>
          </div>

          <p className="text-lg md:text-2xl text-slate-500 leading-relaxed font-medium max-w-2xl">{product.description}</p>

          {/* THE FIX: Changed p-12 to p-5 md:p-16 to stop mobile squeezing */}
          <div className="p-5 md:p-16 rounded-3xl md:rounded-[4rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 space-y-8 md:space-y-12">
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
              <div className={`text-4xl md:text-7xl font-black italic tracking-tighter ${isWholesaleEligible ? 'text-purple-600' : 'text-black'}`}>
                KSh {unitPrice?.toLocaleString()}
              </div>
              {product.isDiscounted && !isWholesaleEligible && (
                <span className="text-lg md:text-2xl text-slate-200 line-through font-bold italic">KSh {product.retailPrice?.toLocaleString()}</span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-12">
              {product.sizes?.length > 0 && (
                <div className="space-y-3 md:space-y-5">
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Size_Matrix</span>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {product.sizes.map((size: string) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        className={`px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black transition-all uppercase tracking-widest ${selectedSize === size ? 'bg-black text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {product.colors?.length > 0 && (
                <div className="space-y-3 md:space-y-5">
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Color_Node</span>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {product.colors.map((color: string) => (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-4 transition-all ${selectedColor === color ? 'border-purple-600 scale-125 shadow-2xl z-10' : 'border-white bg-slate-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 md:pt-12 border-t border-slate-50 space-y-6 md:space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] gap-4 md:gap-0">
                <div className="flex items-center gap-4 md:gap-8 justify-center md:justify-start">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90"><Minus size={18}/></button>
                  <span className="font-black text-2xl md:text-3xl w-8 md:w-10 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90"><Plus size={18}/></button>
                </div>
                <div className="text-center md:text-right">
                  <span className="text-[9px] md:text-[11px] font-black uppercase text-slate-400 block tracking-widest mb-1 md:mb-2">Grand_Total</span>
                  <span className={`text-2xl md:text-3xl font-black italic ${isWholesaleEligible ? 'text-purple-600' : ''}`}>KSh {liveTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid gap-3 md:gap-5">
                <div className="space-y-3">
                  <input
                    type="tel"
                    placeholder="Phone number for payment & delivery (e.g. 0712345678)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={handlePaystackDirect}
                    disabled={syncing !== null}
                    className="w-full h-20 md:h-24 bg-purple-600 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.15em] md:tracking-[0.25em] hover:bg-purple-700 transition-all flex items-center justify-center gap-3 md:gap-5 shadow-xl shadow-purple-200 disabled:opacity-50 italic text-base md:text-xl"
                  >
                    {syncing === 'pay' ? <Loader2 className="animate-spin" /> : null}
                    <span>{syncing === 'pay' ? "Connecting..." : "Pay"}</span>
                  </button>
                <a
                  href={`https://wa.me/254797517565?text=${encodeURIComponent(`Hi Unique Organizers! I'd love to ask about ${product.name} (${typeof window !== 'undefined' ? `${window.location.origin}/product/${product.id}` : `/product/${product.id}`}). `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-16 md:h-20 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.12em] md:tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg text-xs md:text-sm italic"
                >
                  <span>Ask on WhatsApp About This Item</span>
                </a>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-5">
                  <button 
                    onClick={handleDeployToCart}
                    disabled={syncing !== null}
                    className="h-16 md:h-24 bg-black text-white rounded-xl md:rounded-[2.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.25em] hover:bg-purple-600 transition-all flex items-center justify-center gap-2 md:gap-4 italic shadow-lg"
                  >
                    <ShoppingBag size={18} /> Push_to_Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="h-16 md:h-24 bg-white text-slate-900 border border-slate-100 rounded-xl md:rounded-[2.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.25em] hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2 md:gap-4 italic shadow-lg"
                  >
                    <Heart size={18} /> Save_Asset
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-4 md:pt-6">
               <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <ShieldCheck size={16} className="text-purple-600" /> Secure_Protocol
               </div>
               <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <Landmark size={16} className="text-purple-600" /> Pay_on_Node
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}