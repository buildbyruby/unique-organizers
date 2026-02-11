"use client"

import { useState } from 'react'
import { initiateSTKPush } from '../actions'

export default function CheckoutForm({ amount, productName }: { amount: number, productName: string }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePayment = async () => {
    // Basic Kenyan phone validation
    if (!phone || phone.length < 10) return alert("Please enter a valid M-Pesa number")
    
    setLoading(true)
    setMessage("Connecting to M-Pesa...")

    try {
      const result = await initiateSTKPush(phone, amount)

      if (result.success) {
        setIsSuccess(true)
        setMessage(result.message)
        // Optionally: Start a timer to poll the database to see if payment changed to SUCCESS
      } else {
        setIsSuccess(false)
        setMessage(result.message)
      }
    } catch (err) {
      setMessage("An error occurred. Check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-pink-100 shadow-2xl max-w-md mx-auto">
      <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] mb-2 text-center">
        Instant Checkout
      </p>
      <h2 className="text-center text-gray-900 font-bold mb-6 italic">{productName}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">M-Pesa Number</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678" 
            disabled={loading || isSuccess}
            className="w-full mt-1 p-5 rounded-2xl bg-gray-50 border border-pink-50 outline-none focus:ring-2 focus:ring-pink-200 text-lg font-bold text-gray-900 transition-all"
          />
        </div>

        <button 
          onClick={handlePayment}
          disabled={loading || isSuccess}
          className={`w-full text-white py-6 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 group 
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 
              isSuccess ? 'bg-green-500' : 'bg-gray-900 hover:bg-pink-500 active:scale-95'}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          ) : isSuccess ? 'Check Your Phone! ✅' : `Pay KSh ${amount.toLocaleString()} 📱`}
        </button>
      </div>
      
      {message && (
        <div className={`mt-6 p-4 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300
          ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-pink-50 text-pink-600'}`}>
          {message}
        </div>
      )}
    </div>
  )
}