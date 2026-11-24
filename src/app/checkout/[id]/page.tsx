"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ShoppingCart, ArrowLeft, MessageSquare, ShieldCheck, Minus, Plus, Globe, Star, Loader2 } from "lucide-react"
import { getClientPortalData } from "@/app/actions"

export default function CheckoutPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [clientName, setClientName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getClientPortalData().then(res => {
      if (res?.data?.user) {
        const u = res.data.user
        if (u.email && !u.email.includes("guest")) setEmail(u.email)
        if (u.name && u.name !== "Guest Client") setClientName(u.name)
      }
    })

    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id)
        if (found) {
          setProduct(found)
          setSelectedColor(found.colors[0] || "")
        }
      })
  }, [id])

  if (!product) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>

  const isWholesale = quantity >= (product.minWholesale || 5)
  const unitPrice = isWholesale ? product.wholesalePrice : (product.isDiscounted ? product.discountPrice : product.retailPrice)
  const totalCost = unitPrice * quantity

  const handlePaystackBuyNow = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address for your receipt.")
      return
    }
    if (!phone || phone.trim().length < 9) {
      alert("Please enter your phone number for dispatch.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            productId: product.id,
            quantity,
            color: selectedColor,
            pricingTier: isWholesale ? "wholesale" : "retail",
          }],
          email: email.trim(),
          phone: phone.trim(),
          clientName: clientName.trim() || "Customer",
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.authorizationUrl) {
        alert(data.error || "Could not start Paystack payment.")
        setLoading(false)
        return
      }

      window.location.href = data.authorizationUrl
    } catch {
      alert("System Sync Error. Check connection.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="p-8 max-w-7xl mx-auto flex justify-between">
        <Link href="/" className="flex items-center gap-2 text-[10px] uppercase text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back_to_Registry
        </Link>
        <div className="flex items-center gap-2 text-[10px] uppercase text-purple-500">
          <Globe size={12} className="animate-pulse" /> Paystack_Secured_Channel
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 py-12">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img src={product.images[0]} alt={product.name} className="relative rounded-[3rem] border border-white/10 w-full object-cover aspect-square" />
          <Star className="absolute top-6 right-6 text-yellow-500 fill-yellow-500" />
        </div>

        <div>
          <p className="text-purple-500 text-[10px] uppercase tracking-[0.4em] font-black">{product.category?.name || "Collection"}</p>
          <h1 className="text-7xl font-black uppercase mt-6 tracking-tighter italic leading-[0.8]">{product.name}</h1>
          <p className="text-gray-400 mt-6 max-w-md text-sm leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-8 my-10 border-y border-white/5 py-8">
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Standard_Unit</p>
              <p className={`text-4xl font-black ${isWholesale ? "line-through text-gray-800" : ""}`}>KSh {product.retailPrice.toLocaleString()}</p>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -right-2 px-2 py-1 bg-pink-600 text-[8px] font-black uppercase rounded-md rotate-12">Save_Big</div>
              <p className="text-[10px] uppercase text-pink-500 mb-1">Wholesale (5+)</p>
              <p className="text-4xl font-black italic">KSh {product.wholesalePrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-12 mb-8">
            <div>
              <p className="text-[10px] uppercase mb-4 text-gray-500 tracking-widest font-black">Color_Spec</p>
              <div className="flex gap-3">
                {product.colors.map((color: string) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 text-[10px] font-black uppercase rounded-xl border transition-all ${selectedColor === color ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-transparent text-gray-500 border-white/10 hover:border-white/30"}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase mb-4 text-gray-500 tracking-widest font-black">Quantity_Buffer</p>
              <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-2xl p-2 px-6">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="hover:text-purple-500 transition-colors"><Minus size={18} /></button>
                <span className="text-2xl font-black italic min-w-[2ch] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="hover:text-purple-500 transition-colors"><Plus size={18} /></button>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="Full Name for Dispatch"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                placeholder="Email for Receipt *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              />
              <input
                type="tel"
                required
                placeholder="Phone (e.g. 0712345678) *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button onClick={handlePaystackBuyNow} disabled={loading}
            className="w-full h-24 bg-white text-black rounded-[2rem] font-black uppercase flex justify-between px-10 items-center hover:bg-purple-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 duration-300 shadow-xl shadow-white/5">
            <div className="flex items-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              <div className="text-left">
                <p className="text-[10px] opacity-60 leading-none mb-1">{loading ? "Connecting..." : "Paystack Checkout"}</p>
                <p className="text-lg leading-none">Pay_Now</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-50 mb-1">Total_Cost</p>
              <p className="text-3xl font-black italic">KSh {totalCost.toLocaleString()}</p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <a href={`https://wa.me/254797517565?text=Enquiry: ${product.name}`} target="_blank"
              className="h-16 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-[10px] font-black uppercase tracking-widest">
              <MessageSquare size={16} className="text-green-500" /> Live_Assistance
            </a>
            <div className="h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={16} className="text-purple-500" /> Paystack_Verified
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
