import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Package, Clock, CheckCircle, Truck, ArrowUpRight, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UserDashboard() {
  // In a real app, replace with actual session ID
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-4">Member <span className="text-purple-600">Archive</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Managing Global Orders // User_0492</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Active</p>
                <p className="text-xl font-black italic">{orders.filter(o => o.status !== 'DELIVERED').length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Acquired</p>
                <p className="text-xl font-black italic">{orders.length}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="group bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-white/10 transition-all">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="w-20 h-20 rounded-3xl bg-black border border-white/5 overflow-hidden flex-shrink-0">
                    <img src={order.items[0].product.images[0]} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-purple-500 uppercase mb-1">{order.accountReference}</p>
                  <h3 className="text-xl font-black uppercase tracking-tight">{order.items[0].product.name}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Status: {order.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Total Asset Cost</p>
                    <p className="text-2xl font-black italic">KSh {order.totalAmount.toLocaleString()}</p>
                </div>
                <Link href={`/orders/${order.id}`} className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <ArrowUpRight size={20} />
                </Link>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <Package size={40} className="mx-auto mb-6 text-gray-800" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">No active acquisitions detected in system.</p>
                <Link href="/" className="inline-block mt-8 text-[10px] font-black uppercase text-purple-500 border-b border-purple-500 pb-1">Begin Browsing</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}