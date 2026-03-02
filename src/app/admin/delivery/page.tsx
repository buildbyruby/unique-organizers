import prisma from '@/lib/prisma'
import { updateDeliveryStatus } from '../actions'
import { Truck, MapPin, Package, Clock, Zap, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DeliveryDashboard() {
  // Fetching PENDING through DELIVERED so WhatsApp orders show up instantly
  const orders = await prisma.order.findMany({
    where: { 
      status: { in: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] } 
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const steps = ['PENDING', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Fleet_<span className="text-purple-600 underline">Command</span></h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase mt-4">Logistics Node v2.0</p>
        </header>

        <div className="grid gap-6">
          {orders.map((order) => {
            const currentIdx = steps.indexOf(order.deliveryStatus || 'PENDING');
            
            return (
              <div key={order.id} className="bg-[#0c0c0e] border border-zinc-800 rounded-[2rem] p-8 hover:border-purple-500 transition-all">
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                  
                  <div className="w-full lg:w-1/4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                            <Package className="text-purple-500" size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase">Asset ID</p>
                            <p className="font-bold text-sm tracking-widest text-white">{order.accountReference}</p>
                        </div>
                    </div>
                    <div className="text-zinc-400 text-[11px] font-medium flex items-center gap-2">
                        <MapPin size={12} className="text-purple-500" /> {order.phoneNumber}
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex justify-between mb-6">
                      {steps.map((step, i) => (
                        <div key={step} className="flex flex-col items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${currentIdx >= i ? 'bg-purple-500 shadow-[0_0_10px_#9333ea]' : 'bg-zinc-800'}`} />
                          <span className={`text-[8px] font-black uppercase ${currentIdx >= i ? 'text-white' : 'text-zinc-600'}`}>{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-800 to-purple-500 transition-all duration-1000" 
                        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex flex-wrap gap-2 justify-center">
                    {steps.map((status) => (
                      <form key={status} action={async () => { "use server"; await updateDeliveryStatus(order.id, status as any); }}>
                        <button 
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                            order.deliveryStatus === status ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-white hover:text-black'
                          }`}
                        >
                          {status}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-lg">
                        <Zap size={10} className="text-yellow-500" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase">Payment: {order.paymentStatus}</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-2">
                        <Clock size={12} /> Sync: {new Date(order.updatedAt).toLocaleTimeString()}
                    </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}