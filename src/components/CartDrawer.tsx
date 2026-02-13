"use client"
import { useCart } from "@/context/CartContext"
import { ShoppingBag, X, Trash2, MessageCircle } from "lucide-react"

export default function CartDrawer() {
  const { cart, checkout, isOpen, setIsOpen, removeFromCart } = useCart()

  if (!isOpen && cart.length === 0) return null

  return (
    <>
      {/* Floating Button (Always visible if items exist) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-white text-black p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2"
      >
        <ShoppingBag size={20} fill="black" />
        <span className="font-black">{cart.length}</span>
      </button>

      {/* The Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Sidebar */}
          <div className="relative w-full max-w-md bg-[#0a0a0c] h-full border-l border-white/10 p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic">Your <span className="text-purple-500">Stash</span></h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map((item: any) => (
                <div key={item.id + item.color} className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mt-1">
                      {item.color} <span className="text-white mx-2">•</span> x{item.quantity}
                    </p>
                    <p className="text-purple-400 font-mono text-sm mt-1">KSh {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.color)} className="text-gray-600 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-gray-500 text-center mt-20">Your stash is empty.</p>}
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="flex justify-between text-xl font-black italic mb-6">
                <span>TOTAL</span>
                <span>KSh {cart.reduce((a:any, b:any) => a + (b.price * b.quantity), 0).toLocaleString()}</span>
              </div>
              <button 
                onClick={checkout}
                className="w-full bg-[#25D366] text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all"
              >
                <MessageCircle size={20} fill="black" />
                Checkout on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}