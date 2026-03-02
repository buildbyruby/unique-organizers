"use client"
import { useCart } from "@/context/CartContext";
import { X, Trash2, ShoppingBag, MessageCircle, Landmark, Tag } from "lucide-react";

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, removeFromCart, checkout } = useCart();

  // Calculate total based on dynamic item prices
  const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <>
      {/* 1. BACKDROP: Dims the rest of the site */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" 
        onClick={() => setIsOpen(false)} 
      />

      {/* 2. SIDEBAR PANEL: Stays in front of everything */}
      <aside className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white z-[9999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-purple-400" />
            <h2 className="text-xl font-black italic tracking-tighter uppercase">Your Stash</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
            <X size={24} />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingBag size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Archive Empty</p>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={`${item.id}-${item.color}-${item.size}-${item.pricingTier}`} className="flex gap-4 group animate-in fade-in slide-in-from-right-4">
                <div className="w-20 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black uppercase text-xs text-slate-900 leading-tight mb-1 max-w-[180px]">{item.name}</h4>
                    {item.pricingTier === 'wholesale' ? (
                      <div className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Landmark size={10} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Bulk</span>
                      </div>
                    ) : (
                      <div className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tag size={10} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Retail</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Color: <span className="text-slate-900">{item.color || 'N/A'}</span>
                    </p>
                    {item.size && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Size: <span className="text-slate-900">{item.size}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className={`font-black italic text-sm ${item.pricingTier === 'wholesale' ? 'text-pink-600' : 'text-slate-900'}`}>
                      {item.quantity} x KSh {item.price.toLocaleString()}
                    </p>
                    <button 
                      onClick={() => removeFromCart(item.id, item.color, item.pricingTier, item.size)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER / CHECKOUT */}
        {cart.length > 0 && (
          <div className="p-6 border-t bg-slate-50 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Subtotal</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Excludes Delivery Fee</span>
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-slate-900">KSh {total.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={checkout}
              className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:shadow-[0_15px_30px_rgba(37,211,102,0.3)] transition-all active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <MessageCircle size={20} fill="currentColor" className="relative z-10" />
              <span className="relative z-10">Finalize on WhatsApp</span>
            </button>
            
            <p className="text-[8px] text-center font-bold text-slate-400 uppercase tracking-widest">
              Stock availability confirmed upon dispatch
            </p>
          </div>
        )}
      </aside>
    </>
  );
}