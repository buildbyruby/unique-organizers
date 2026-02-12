import prisma from '@/lib/prisma'
import { Package, Clock, CheckCircle2, Truck, XCircle, User as UserIcon } from 'lucide-react'
import StatusSelect from './StatusSelect' // Import the component we just made

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} className="text-yellow-500" />
      case 'PROCESSING': return <Package size={14} className="text-blue-500" />
      case 'SHIPPED': return <Truck size={14} className="text-purple-500" />
      case 'DELIVERED': return <CheckCircle2 size={14} className="text-green-500" />
      case 'CANCELLED': return <XCircle size={14} className="text-red-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#020203] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 pt-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Command <span className="text-purple-600">Center</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Live Order Stream // Operational</p>
        </header>

        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-8 flex flex-col md:row gap-8 items-start justify-between hover:border-white/10 transition-all">
              
              <div className="flex flex-col md:flex-row w-full gap-8">
                {/* CUSTOMER INFO */}
                <div className="flex gap-4 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <UserIcon size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Customer</p>
                    <p className="font-bold text-white">{order.user?.name || order.user?.email || "Guest"}</p>
                    <p className="text-[10px] font-mono text-purple-500 mt-1 uppercase">REF: {order.accountReference || 'N/A'}</p>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Manifest</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="font-medium text-gray-300">{item.product.name} <span className="text-purple-500">x{item.quantity}</span></span>
                        <span className="font-bold italic text-white">KSh {item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATS & STATUS */}
                <div className="w-full md:w-auto flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-3xl font-black italic tracking-tighter">KSh {order.totalAmount.toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* CLIENT COMPONENT INSERTED HERE */}
                    <StatusSelect orderId={order.id} currentStatus={order.status} />
                    
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                      {getStatusIcon(order.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <Package size={48} className="mx-auto mb-4 text-gray-700" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">No active transmissions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}