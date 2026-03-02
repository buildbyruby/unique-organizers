import prisma from '@/lib/prisma'
import { Truck, MapPin, Package, Phone, CheckCircle2, Clock, Navigation } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LiveTrackingPage({ params }: { params: { link: string } }) {
  const order = await prisma.order.findUnique({
    where: { uniqueOrderLink: params.link },
    include: { items: { include: { product: true } } }
  })

  if (!order) notFound()

  const timeline = Array.isArray(order.trackingTimeline) ? (order.trackingTimeline as any[]).reverse() : []
  const currentStatus = order.deliveryStatus || 'PENDING'
  
  const statusConfig: any = {
    PENDING: { color: 'text-zinc-500', icon: Clock, msg: 'Preparing your items...' },
    ASSIGNED: { color: 'text-blue-500', icon: Phone, msg: 'Delivery partner assigned!' },
    DISPATCHED: { color: 'text-purple-500', icon: Package, msg: 'On the way to you.' },
    IN_TRANSIT: { color: 'text-yellow-500', icon: Navigation, msg: 'Almost there! Carrier is nearby.' },
    DELIVERED: { color: 'text-green-500', icon: CheckCircle2, msg: 'Successfully Delivered!' }
  }

  const Config = statusConfig[currentStatus] || statusConfig.PENDING

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* LIVE STATUS CARD */}
        <div className="p-8 pt-12 text-center flex-shrink-0">
          <div className="relative inline-block mb-6">
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${Config.color.replace('text', 'bg')}`} />
            <Config.icon size={64} className={`relative ${Config.color} mx-auto transition-all duration-1000 animate-pulse`} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{currentStatus.replace('_', ' ')}</h1>
          <p className="text-zinc-400 text-sm font-medium">{Config.msg}</p>
        </div>

        {/* ORDER DETAILS PANEL */}
        <div className="bg-[#0c0c0e] rounded-t-[3rem] flex-1 p-8 border-t border-zinc-800/50 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tracking Number</p>
                <p className="font-bold text-lg">#UNIQ-{order.id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="bg-purple-600/10 border border-purple-500/20 px-4 py-2 rounded-2xl">
                <p className="text-[9px] font-black text-purple-500 uppercase">Live Update</p>
                <p className="text-xs font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* DESTINATION SECTION */}
            <div className="flex gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_#9333ea]" />
                    <div className="w-[1px] h-full bg-gradient-to-b from-purple-500 to-transparent" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Destination Address</p>
                    <p className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                        <MapPin size={14} className="text-purple-500" /> {order.phoneNumber}
                    </p>
                </div>
            </div>

            {/* LIVE LOGS */}
            <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase mb-6 tracking-[0.2em]">Activity History</p>
                <div className="space-y-8">
                    {timeline.length > 0 ? timeline.map((event, i) => (
                        <div key={i} className="flex gap-6 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-purple-500' : 'bg-zinc-800'}`} />
                                {i !== timeline.length - 1 && <div className="w-[1px] h-12 bg-zinc-900" />}
                            </div>
                            <div>
                                <p className={`text-xs font-black uppercase ${i === 0 ? 'text-white' : 'text-zinc-500'}`}>{event.status.replace('_', ' ')}</p>
                                <p className="text-[10px] text-zinc-600 mt-1">{new Date(event.time).toLocaleString()}</p>
                                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{event.message}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-[10px] font-bold text-zinc-700 uppercase italic">Awaiting initial transmission...</p>
                    )}
                </div>
            </div>
          </div>

          {/* ITEM PREVIEW */}
          <div className="mt-12 pt-8 border-t border-zinc-900">
             <div className="flex items-center gap-3 mb-4">
                <Truck size={14} className="text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Shipment Contents</span>
             </div>
             <div className="flex -space-x-3">
                {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl border-2 border-black bg-zinc-900 overflow-hidden">
                        <img src={item.product.images[0]} className="w-full h-full object-cover" alt="pkg" />
                    </div>
                ))}
                {order.items.length > 4 && (
                    <div className="w-12 h-12 rounded-xl border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-black">
                        +{order.items.length - 4}
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-8 flex-shrink-0">
            <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-600 hover:text-white transition-all">
                Contact Support
            </button>
        </div>
      </div>
    </div>
  )
}