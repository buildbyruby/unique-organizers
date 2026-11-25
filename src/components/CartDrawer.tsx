"use client"
import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { ShoppingBag, X, Trash2, CreditCard, Loader2, Minus, Plus } from "lucide-react"

export default function CartDrawer() {
  const { cart, cartCount, isOpen, setIsOpen, removeFromCart, updateQuantity, cartTotal } = useCart()
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

  const cartSummary = cart
    .map((item: any) => `- ${item.name || "Item"} (${item.quantity || 1}x @ KSh ${(item.price ?? 0).toLocaleString()})`)
    .join("\n");
  const helpText = `Hi Unique Organizers! I need help before paying for my order (Total: KSh ${cartTotal.toLocaleString()}):\n${cartSummary}`;
  const waHelpUrl = `https://wa.me/254797517565?text=${encodeURIComponent(helpText)}`;

  return (
    <>
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] bg-black text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-purple-500 hover:scale-110 transition-all"
        >
          <ShoppingBag size={24} />
          <span className="font-bold text-lg">{cartCount}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-[#121214] text-white h-full shadow-2xl flex flex-col p-6 border-l border-purple-500/30">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  YOUR <span className="text-purple-500">STASH</span>
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                  {cartCount} {cartCount === 1 ? "item" : "items"} ready
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/#catalog"
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  + Add More
                </Link>
                <button type="button" onClick={() => setIsOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <img
                    src={item.image || "https://placehold.co/200x200?text=No+Image"}
                    className="w-20 h-20 object-cover rounded-lg bg-white/10 shrink-0"
                    alt={item.name || "Product"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-snug truncate">{item.name || "Unknown Product"}</p>
                    <p className="text-purple-400 text-xs font-mono mt-1 italic">
                      {(item.pricingTier || "RETAIL").toUpperCase()} • {item.color || "Standard"}
                      {item.size && item.size !== "N/A" ? ` • ${item.size}` : ""}
                    </p>
                    <div className="flex justify-between items-center mt-3 gap-2">
                      <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-0.5 text-gray-300 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-0.5 text-gray-300 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="font-black text-base text-white">
                          <span className="text-[10px] text-gray-400 mr-1">KSh</span>
                          {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black uppercase py-3.5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <CreditCard size={22} />}
                {loading ? "Connecting..." : "Pay"}
              </button>

              <a
                href={waHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 text-xs tracking-wider transition-all"
              >
                Need Help Before Paying? Chat on WhatsApp
              </a>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
