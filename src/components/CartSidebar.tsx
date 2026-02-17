"use client"
import { useCart } from "@/context/CartContext"; // Adjust path as needed
import { X, Trash2, ShoppingBag, MessageCircle } from "lucide-react";

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, removeFromCart, checkout } = useCart();

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
              <div key={`${item.id}-${item.color}-${item.pricingTier}`} className="flex gap-4 group">
                <div className="w-20 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-black uppercase text-xs text-slate-900 leading-tight mb-1">{item.name}</h4>
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2">
                    {item.pricingTier} • {item.color || 'Standard'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-black italic text-sm">
                      {item.quantity} x KSh {item.price.toLocaleString()}
                    </p>
                    <button 
                      onClick={() => removeFromCart(item.id, item.color, item.pricingTier)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
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
          <div className="p-6 border-t bg-slate-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Subtotal Total</span>
              <span className="text-2xl font-black italic">KSh {total.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={checkout}
              className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:shadow-[0_10px_30px_rgba(37,211,102,0.3)] transition-all active:scale-95"
            >
              <MessageCircle size={20} fill="currentColor" />
              Checkout on WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}