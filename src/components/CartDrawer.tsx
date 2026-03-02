"use client"
import { useCart } from "@/context/CartContext"
import { ShoppingBag, X, Trash2, MessageCircle } from "lucide-react"

export default function CartDrawer() {
  const { cart, checkout, isOpen, setIsOpen, removeFromCart } = useCart()

  // Always show the trigger button if there are items
  return (
    <>
      {/* TRIGGER BUTTON: Forced to the top layer */}
      {cart.length > 0 && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] bg-black text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-purple-500 hover:scale-110 transition-all"
        >
          <ShoppingBag size={24} />
          <span className="font-bold text-lg">{cart.length}</span>
        </button>
      )}

      {/* THE ACTUAL DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          {/* Darker Backdrop to hide the broken UI behind it */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          {/* Sidebar: Solid background, high contrast */}
          <div className="relative w-full max-w-md bg-[#121214] text-white h-full shadow-2xl flex flex-col p-6 border-l border-purple-500/30">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                YOUR <span className="text-purple-500">STASH</span>
              </h2>
              <button onClick={() => setIsOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
                <X size={24}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map((item: any) => (
                <div key={`${item.id}-${item.color}-${item.pricingTier}`} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <img 
                    src={item.image || "https://placehold.co/200x200?text=No+Image"} 
                    className="w-20 h-20 object-cover rounded-lg bg-white/10" 
                    alt={item.name || "Product"} 
                  />
                  <div className="flex-1">
                    <p className="font-bold text-lg leading-none">{item.name || "Unknown Product"}</p>
                    <p className="text-purple-400 text-sm font-mono mt-1 italic">
                      {(item.pricingTier || "RETAIL").toUpperCase()} • {item.color || "Standard"}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="font-black text-xl text-white">
                        {item.quantity}x <span className="text-xs text-gray-400">KSh</span> {(item.price ?? 0).toLocaleString()}
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.id, item.color, item.pricingTier)}
                        className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/20 mt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Grand Total</span>
                <span className="text-3xl font-black text-white italic">
                  KSh {cart.reduce((a: any, b: any) => a + ((b.price ?? 0) * (b.quantity ?? 0)), 0).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={checkout}
                disabled={cart.length === 0}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                <MessageCircle size={28} fill="black" />
                Send Order to WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}