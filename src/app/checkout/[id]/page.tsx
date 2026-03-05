"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ShoppingCart, ArrowLeft, MessageSquare, ShieldCheck, Minus, Plus, Globe, Star, Loader2 } from "lucide-react"
import { initiateOrder, getClientPortalData } from "@/app/actions"

export default function CheckoutPage() {
  const router = useRouter()
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getClientPortalData().then(res => {
      if (res?.data?.user) setUser(res.data.user)
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

  const handleAcquisition = async () => {
    let finalName = user?.name || "";
    
    // Check if they are part of the new seamless guest session
    if (!user || user.name === "Guest Client") {
      const promptedName = window.prompt("Enter your full name for dispatch:");
      if (!promptedName) return; // User cancelled
      finalName = promptedName;
    }

    const phoneInput = window.prompt("Enter M-Pesa Number for logistics (e.g. 254712345678):")
    if (!phoneInput) return

    setLoading(true)
    try {
      const orderItems = [{ id: product.id, quantity, price: unitPrice, color: selectedColor }]
      
      const result = await initiateOrder(orderItems, phoneInput, totalCost, finalName)

      if (result.success) {
        router.push(`/orders/${result.data.trackingLink}`)
      } else {
        alert("Acquisition Protocol Failed: " + result.message)
      }
    } catch (err) {
      alert("System Sync Error. Check connection.")
    } finally {
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
          <Globe size={12} className="animate-pulse" /> Secure_Channel_Active
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 py-12">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img src={product.images[0]} alt={product.name} className="relative rounded-[3rem] border border-white/10 w-full object-cover aspect-square" />
          <Star className="absolute top-6 right-6 text-yellow-500 fill-yellow-500" />
        </div>

        <div>
          <p className="text-purple-500 text-[10px] uppercase tracking-[0.4em] font-black">{product.category}</p>
          <h1 className="text-7xl font-black uppercase mt-6 tracking-tighter italic leading-[0.8]">{product.name}</h1>
          <p className="text-gray-400 mt-6 max-w-md text-sm leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-8 my-12 border-y border-white/5 py-10">
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

          <div className="flex flex-wrap gap-12 mb-12">
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

          <button onClick={handleAcquisition} disabled={loading}
            className="w-full h-24 bg-white text-black rounded-[2rem] font-black uppercase flex justify-between px-10 items-center hover:bg-purple-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 duration-300 shadow-xl shadow-white/5">
            <div className="flex items-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              <div className="text-left">
                <p className="text-[10px] opacity-60 leading-none mb-1">{loading ? "Authorizing..." : "Finalize"}</p>
                <p className="text-lg leading-none">Initialize_Acquisition</p>
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
              <ShieldCheck size={16} className="text-purple-500" /> Secure_Protocol
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}