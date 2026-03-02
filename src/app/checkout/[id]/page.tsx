"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  ShoppingCart,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Minus,
  Plus,
  Globe,
  Star,
  Loader2,
} from "lucide-react"
import { initiateOrder } from "@/app/actions"

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch real product data from your API
  useEffect(() => {
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id)
        if (found) {
          setProduct(found)
          setSelectedColor(found.colors[0])
        }
      })
  }, [id])

  if (!product) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" />
    </div>
  )

  const isWholesale = quantity >= (product.minWholesale || 5)
  const unitPrice = isWholesale ? product.wholesalePrice : (product.isDiscounted ? product.discountPrice : product.retailPrice)
  const totalCost = unitPrice * quantity

  const handleAcquisition = async () => {
    const phone = window.prompt("Enter M-Pesa Number (e.g. 254712345678)")
    if (!phone) return

    setLoading(true)
    try {
      const orderItems = [{
        id: product.id,
        quantity,
        price: unitPrice,
        color: selectedColor
      }]

      const result = await initiateOrder(orderItems, null, phone, totalCost)

      if (result.success) {
        // Redirect to the Secure Order Verification Link (Objective 3)
        router.push(`/orders/${result.data.link}`)
      } else {
        alert("Transaction Failed: " + result.message)
      }
    } catch (err) {
      alert("System Error during acquisition.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="p-8 max-w-7xl mx-auto flex justify-between">
        <Link href="/" className="flex items-center gap-2 text-[10px] uppercase text-gray-500">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2 text-[10px] uppercase text-purple-500">
          <Globe size={12} className="animate-spin-slow" /> Logistics Online
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 py-12">
        <div className="relative">
          <img src={product.images[0]} alt={product.name} className="rounded-[3rem] border border-white/10 w-full object-cover aspect-square" />
          <Star className="absolute top-6 right-6 text-yellow-500 fill-yellow-500" />
        </div>

        <div>
          <p className="text-purple-500 text-[10px] uppercase tracking-widest">{product.category}</p>
          <h1 className="text-7xl font-black uppercase mt-6 tracking-tighter italic leading-[0.8]">{product.name}</h1>
          <p className="text-gray-400 mt-6 max-w-md">{product.description}</p>

          <div className="grid grid-cols-2 gap-8 my-12 border-y border-white/5 py-10">
            <div>
              <p className="text-[10px] uppercase text-gray-500">Standard</p>
              <p className={`text-4xl font-black ${isWholesale ? "line-through text-gray-700" : ""}`}>
                KSh {product.retailPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-pink-500">Wholesale (5+ Units)</p>
              <p className="text-4xl font-black italic">KSh {product.wholesalePrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-12 mb-12">
            <div>
              <p className="text-[10px] uppercase mb-3 text-gray-500 tracking-widest">Selected Color</p>
              <div className="flex gap-3">
                {product.colors.map((color: string) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-5 py-3 text-[10px] uppercase rounded-xl border transition-all ${selectedColor === color ? "bg-white text-black border-white" : "bg-transparent text-gray-500 border-white/10"}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase mb-3 text-gray-500 tracking-widest">Quantity</p>
              <div className="flex items-center gap-6 bg-white/5 rounded-2xl p-2 px-6">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="hover:text-purple-500"><Minus size={18} /></button>
                <span className="text-2xl font-black italic min-w-[2ch] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="hover:text-purple-500"><Plus size={18} /></button>
              </div>
            </div>
          </div>

          <button onClick={handleAcquisition} disabled={loading}
            className="w-full h-24 bg-white text-black rounded-3xl font-black uppercase flex justify-between px-10 items-center hover:bg-purple-600 hover:text-white transition-all">
            <div className="flex items-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              {loading ? "Authorizing..." : "Initialize Acquisition"}
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-50">Total Node Cost</p>
              <p className="text-2xl font-black italic">KSh {totalCost.toLocaleString()}</p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <a href={`https://wa.me/25497517565?text=Order Enquiry: ${product.name}`}
              className="h-16 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
              <MessageSquare className="text-green-500" /> Live Assistance
            </a>
            <div className="h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2">
              <ShieldCheck className="text-purple-500" /> Secure Protocol
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}