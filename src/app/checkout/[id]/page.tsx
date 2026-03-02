"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Minus,
  Plus,
  Globe,
  Star,
} from "lucide-react"

/**
 * TEMP PRODUCT SOURCE
 * Replace this with props OR fetch() if needed
 */
const product = {
  id: "prod_001",
  name: "NEURAL CORE",
  description: "High-performance system module engineered for scale.",
  category: "Hardware",
  images: ["/product.jpg"],
  colors: ["Black", "Silver", "Carbon"],
  retailPrice: 12000,
  wholesalePrice: 9500,
}

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [loading, setLoading] = useState(false)

  const isWholesale = quantity >= 5
  const unitPrice = isWholesale
    ? product.wholesalePrice
    : product.retailPrice
  const totalCost = unitPrice * quantity

  const handleAcquisition = async () => {
    setLoading(true)

    const phone = window.prompt(
      "Enter M-Pesa Number (e.g. 254712345678)"
    )

    if (!phone) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          color: selectedColor,
          phone,
          amount: totalCost,
        }),
      })

      if (res.ok) {
        alert("STK Push sent. Check your phone 📲")
      } else {
        alert("Payment failed")
      }
    } catch {
      alert("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* NAV */}
      <nav className="p-8 max-w-7xl mx-auto flex justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] uppercase text-gray-500"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-2 text-[10px] uppercase text-purple-500">
          <Globe size={12} className="animate-spin-slow" />
          Logistics Online
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 py-12">
        {/* IMAGE */}
        <div className="relative">
          <img
            src={product.images?.[0] || "/placeholder-product.jpg"}
            alt={product.name}
            className="rounded-[3rem] border border-white/10"
          />
          <Star className="absolute top-6 right-6 text-yellow-500 fill-yellow-500" />
        </div>

        {/* CONTENT */}
        <div>
          <p className="text-purple-500 text-[10px] uppercase tracking-widest">
            {product.category}
          </p>

          <h1 className="text-7xl font-black uppercase mt-6">
            {product.name}
          </h1>

          <p className="text-gray-400 mt-6 max-w-md">
            {product.description}
          </p>

          {/* PRICE */}
          <div className="grid grid-cols-2 gap-8 my-12 border-y border-white/5 py-10">
            <div>
              <p className="text-[10px] uppercase">Retail</p>
              <p
                className={`text-4xl font-black ${
                  isWholesale ? "line-through text-gray-600" : ""
                }`}
              >
                KSh {product.retailPrice.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase text-pink-500">
                Wholesale
              </p>
              <p className="text-4xl font-black">
                KSh {product.wholesalePrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="flex gap-12 mb-12">
            <div>
              <p className="text-[10px] uppercase mb-3">Color</p>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-3 text-[10px] uppercase rounded-xl ${
                      selectedColor === color
                        ? "bg-white text-black"
                        : "bg-white/5 text-gray-500"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase mb-3">Qty</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus />
                </button>
                <span className="text-xl">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>
                  <Plus />
                </button>
              </div>
            </div>
          </div>

          {/* BUY */}
          <button
            onClick={handleAcquisition}
            disabled={loading}
            className="w-full h-24 bg-white text-black rounded-3xl font-black uppercase flex justify-between px-10 items-center"
          >
            <div className="flex items-center gap-4">
              <ShoppingCart />
              {loading ? "Processing..." : "Secure Acquisition"}
            </div>
            <div className="text-right">
              <p className="text-[10px]">Total</p>
              <p className="text-xl">
                KSh {totalCost.toLocaleString()}
              </p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <a
              href={`https://wa.me/25497517565?text=Enquiry: ${product.name}`}
              className="h-16 border border-white/10 rounded-xl flex items-center justify-center gap-2"
            >
              <MessageSquare className="text-green-500" /> WhatsApp
            </a>

            <div className="h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2">
              <ShieldCheck className="text-purple-500" /> Insured
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
