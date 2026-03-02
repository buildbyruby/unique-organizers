"use client"

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function CheckoutForm({ amount, productName }: { amount: number, productName: string }) {
  const [phone, setPhone] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // System Upgrade: Bridge the legacy checkout form to the new Cart Context
  const { cart, cartTotal } = useCart()

  const handleWhatsAppOrder = () => {
    if (!phone || phone.length < 10) return alert("Please enter a valid phone number")
    
    setIsRedirecting(true)
    
    const myNumber = "254797517565" 
    let message = ''

    // MULTI-ITEM CHECKOUT LOGIC: Triggered if cart is populated
    if (cart && cart.length > 0) {
      message = `*NEW SYSTEM ORDER* 📦\n`
      message += `--------------------------------\n\n`

      cart.forEach((item: any, index: number) => {
        const lineTotal = item.price * item.quantity
        message += `*${index + 1}. ${item.name.toUpperCase()}*\n`
        
        // Accurate string injection for variants
        message += `   Attributes: ${item.color}${item.size && item.size !== 'N/A' ? ` | Size: ${item.size}` : ''}\n`
        message += `   Pricing: ${item.pricingTier.toUpperCase()}\n`
        message += `   Qty: ${item.quantity} x KSh ${item.price.toLocaleString()}\n`
        message += `   Subtotal: *KSh ${lineTotal.toLocaleString()}*\n\n`
      })

      message += `--------------------------------\n`
      message += `💰 *GRAND TOTAL: KSh ${cartTotal.toLocaleString()}*\n`
      message += `--------------------------------\n\n`
      message += `*Customer Contact:* ${phone}\n`
      message += `_Please confirm availability for delivery._`
    } else {
      // LEGACY FALLBACK: Preserves routing logic if someone accesses a direct Buy Now link without a cart
      message = `Hello Unique Organizers! I'd like to order: ${productName}. My phone number is ${phone}. Total: KSh ${amount.toLocaleString()}`
    }

    // Direct encoding ensures no spaces or line breaks are lost in transit
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${myNumber}?text=${encodedMessage}`, '_blank')
    
    setTimeout(() => setIsRedirecting(false), 2000)
  }

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-pink-100 shadow-2xl max-w-md mx-auto">
      <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-2 text-center">
        {cart && cart.length > 0 ? 'Multi-Item Order' : 'Instant Order'}
      </p>
      <h2 className="text-center text-gray-900 font-bold mb-6 italic">
        {cart && cart.length > 0 ? `Cart Total: KSh ${cartTotal.toLocaleString()}` : productName}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Your Phone Number</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0797517565" 
            className="w-full mt-1 p-5 rounded-2xl bg-gray-50 border border-pink-50 outline-none focus:ring-2 focus:ring-pink-200 text-lg font-bold text-gray-900 transition-all"
          />
        </div>

        <button 
          onClick={handleWhatsAppOrder}
          disabled={isRedirecting}
          className="w-full text-white py-6 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 group bg-gray-900 hover:bg-green-500 active:scale-95"
        >
          {isRedirecting ? 'Opening WhatsApp...' : `Order via WhatsApp 💬`}
        </button>
      </div>
      
      <div className="mt-6 p-4 rounded-xl text-center text-[10px] font-bold bg-gray-50 text-gray-400 uppercase tracking-widest">
        Direct to +254 797 517 565
      </div>
    </div>
  )
}