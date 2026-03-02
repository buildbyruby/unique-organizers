"use client"

import { useState, useEffect } from 'react'
import { Package, Heart, ShoppingCart, MessageSquare, ChevronRight, ShoppingBag, User, Truck, LogOut, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getClientPortalData, logout, removeFromCart, toggleWishlist } from '@/app/actions'

export default function ClientPortal() {
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'cart'>('orders')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = () => {
    getClientPortalData().then(res => {
      setData(res)
      setLoading(false)
    })
  }

  // ADVANCED WHATSAPP CHECKOUT
  const handleWhatsAppCheckout = () => {
    if (!data?.cart || data.cart.length === 0) return;
    
    const WHATSAPP_NUMBER = "254700000000"; // Ensure this is your actual number
    
    // 1. Build the manifest of all items
    const cartManifest = data.cart.map((item: any) => 
      `• ${item.product.name} | Qty: ${item.quantity} | KSh ${item.product.retailPrice.toLocaleString()}`
    ).join('\n');

    // 2. Calculate Total
    const total = data.cart.reduce((sum: number, item: any) => sum + (item.product.retailPrice * item.quantity), 0);

    // 3. Create the professional formatted message
    const message = encodeURIComponent(
      `✨ *NEW ORDER FROM PORTAL*\n\n` +
      `*Customer:* ${data.email}\n\n` +
      `*Items:*\n${cartManifest}\n\n` +
      `*TOTAL AMOUNT: KSh ${total.toLocaleString()}*\n\n` +
      `Please confirm availability for delivery.`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="text-purple-600" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Portal...</p>
      </div>
    </div>
  )

  if (!data) return <div className="p-20 text-center font-black uppercase">Unauthorized Access. Please Login.</div>

  const WHATSAPP_NUMBER = "254700000000"

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Unique_<span className="text-purple-600">Portal</span></h1>
          
          {/* USER NAV & CART COUNTER */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('cart')}
              className="relative text-slate-400 hover:text-black transition-colors flex items-center"
            >
              <ShoppingCart size={20} />
              {data.cart?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {data.cart.length}
                </span>
              )}
            </button>
            <span className="text-[9px] font-black uppercase text-slate-400 hidden md:block">Active: {data.email}</span>
            <button onClick={() => logout()} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* TABS SELECTOR */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mb-12 shadow-sm">
          {['orders', 'wishlist', 'cart'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black'
              }`}
            >
              {tab} {tab === 'cart' && data.cart?.length > 0 && `(${data.cart.length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {data.orders?.length > 0 ? data.orders.map((order: any) => (
                  <Link key={order.id} href={`/track/${order.uniqueOrderLink}`} className="block bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center"><Package className="text-slate-300" /></div>
                        <div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">ID: {order.uniqueOrderLink}</p>
                          <p className="font-black italic">KSh {order.totalAmount.toLocaleString()}</p>
                          <div className="mt-2 px-3 py-1 bg-purple-50 text-purple-600 text-[8px] font-black rounded-full w-fit uppercase">{order.deliveryStatus}</div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300" />
                    </div>
                  </Link>
                )) : <EmptyState icon={Package} label="No active transmissions" />}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.wishlist?.length > 0 ? data.wishlist.map((item: any) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={item.product.images[0]} className="w-16 h-16 object-cover rounded-xl" />
                      <p className="text-[10px] font-black uppercase italic">{item.product.name}</p>
                    </div>
                    <button onClick={async () => { await toggleWishlist(item.product.id); refreshData(); }}>
                      <Heart size={18} className="text-red-500" fill="currentColor" />
                    </button>
                  </div>
                )) : <EmptyState icon={Heart} label="Your wishlist is empty" />}
              </div>
            )}

            {/* CART TAB */}
            {activeTab === 'cart' && (
              <div className="space-y-4">
                {data.cart?.length > 0 ? (
                  <>
                    {data.cart.map((item: any) => (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <img src={item.product.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                          <div>
                            <p className="text-xs font-black uppercase">{item.product.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-black italic text-purple-600 hidden sm:block">KSh {(item.product.retailPrice * item.quantity).toLocaleString()}</p>
                          <button onClick={async () => { await removeFromCart(item.id); refreshData(); }} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleWhatsAppCheckout} className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-purple-600 transition-all">
                      PROCEED TO CHECKOUT <MessageSquare size={18} />
                    </button>
                  </>
                ) : <EmptyState icon={ShoppingCart} label="Your cart is empty" />}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-black rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <h3 className="text-2xl font-black italic mb-2 relative z-10">Concierge</h3>
              <p className="text-xs text-slate-400 mb-8 italic relative z-10">Direct management channel for your inquiries.</p>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')} className="w-full bg-purple-600 py-5 rounded-2xl text-[10px] font-black uppercase hover:bg-purple-500 transition shadow-lg relative z-10 flex justify-center items-center gap-2">
                Open WhatsApp Line <ArrowRight size={14} />
              </button>
              <ShoppingBag className="absolute -bottom-6 -right-6 text-white/5" size={150} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* --- THE PERFECTED EMPTY STATE --- */
function EmptyState({ icon: Icon, label }: any) {
  return (
    <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Icon size={32} className="text-slate-300" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">{label}</p>
      
      {/* THE START EXPLORING BUTTON */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase border-b-2 border-purple-600 pb-1 tracking-[0.2em] hover:text-black hover:border-black transition-all"
      >
        Start Exploring <ArrowRight size={14} />
      </Link>
    </div>
  )
}