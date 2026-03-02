import { prisma } from '@/lib/prisma'
import { Package, Phone } from 'lucide-react'
import OrderStatusManager from '@/components/OrderStatusManager'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-black p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 pt-10 border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Order_<span className="text-purple-600">Logs</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">
            Live Transaction Monitoring
          </p>
        </header>

        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase">
                        {order.accountReference}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border">
                          <img src={item.product.images[0]} alt="" className="object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">{item.product.name}</p>
                          <div className="flex gap-3 mt-1">
                             <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border">COLOR: {item.color || 'Standard'}</span>
                             <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border">SIZE: {item.size || 'Standard'}</span>
                             <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded">QTY: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-64 space-y-6 border-l border-slate-100 lg:pl-10 flex flex-col justify-center">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Customer Phone</p>
                      <p className="text-sm font-bold flex items-center gap-2"><Phone size={14} className="text-purple-500"/> {order.phoneNumber}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Total Revenue</p>
                      <p className="text-2xl font-black italic">KSh {order.totalAmount.toLocaleString()}</p>
                   </div>
                   
                   {/* This is the Client Component that handles the interaction */}
                   <OrderStatusManager orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Package className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for live signals...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}