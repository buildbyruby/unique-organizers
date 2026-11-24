"use client"
import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { ShoppingBag, X, Trash2, CreditCard, Loader2 } from "lucide-react"

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, cartTotal } = useCart()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePaystackCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phone || phone.trim().length < 9) {
      setError("Please enter your phone number (e.g. 0712345678).")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          email: email.trim() || undefined,
          phone: phone.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.authorizationUrl) {
        setError(data.error || "Could not start payment.")
        setLoading(false)
        return
      }

      window.location.href = data.authorizationUrl
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <>
      {cart.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] bg-black text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-purple-500 hover:scale-110 transition-all"
        >
          <ShoppingBag size={24} />
          <span className="font-bold text-lg">{cart.length}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-[#121214] text-white h-full shadow-2xl flex flex-col p-6 border-l border-purple-500/30">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                YOUR <span className="text-purple-500">STASH</span>
              </h2>
              <button onClick={() => setIsOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
                <X size={24} />
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
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handlePaystackCheckout} className="pt-5 border-t border-white/20 mt-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Grand Total</span>
                <span className="text-3xl font-black text-white italic">
                  KSh {cartTotal.toLocaleString()}
                </span>
              </div>

              <input
                type="tel"
                required
                placeholder="Phone number (e.g. 0712345678) *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              />

              <input
                type="email"
                placeholder="Email for receipt (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              />

              {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={cart.length === 0 || loading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <CreditCard size={22} />}
                {loading ? "Connecting..." : "Pay"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
