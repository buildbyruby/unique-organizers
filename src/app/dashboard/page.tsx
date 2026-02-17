import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Package, ShoppingBag, ArrowLeft } from 'lucide-react'

// Prevent caching so orders are always up-to-date
export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  // TODO: Replace with actual user ID from session/auth in the future
  const userId = "cml5imk0y0006qlln004m9hzc" 
  
  // Fetch user's orders
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 p-10 flex flex-col gap-12 hidden lg:flex border-r border-white/5 shadow-2xl">
        <Link href="/" className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-2 group">
          UNIQUE <span className="text-purple-500 group-hover:text-purple-400 transition-colors">ORG</span>
        </Link>
        <nav className="flex flex-col gap-8">
          {/* Only the Orders link remains */}
          <Link href="/dashboard" className="flex items-center gap-3 text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
            <ShoppingBag size={18} /> Orders
          </Link>
        </nav>
        
        <div className="mt-auto">
           <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
             <ArrowLeft size={14}/> Return to Archives
           </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-16 relative overflow-y-auto">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-1 bg-purple-600 rounded-full" />
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Personal Collection</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900">
            Client <span className="text-purple-700">Panel</span>
          </h1>
        </header>

        <div className="max-w-5xl space-y-10">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
             Deployment History <div className="flex-grow h-[1px] bg-slate-200" />
          </h2>
          
          <div className="grid gap-6">
            {/* Order List */}
            {orders.map((order) => (
              <div key={order.id} className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(147,51,234,0.08)] transition-all duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex gap-8 items-center">
                  <div className="h-20 w-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Package size={32} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2 border-b border-purple-100 pb-1 inline-block">Ref: {order.accountReference}</p>
                    <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter group-hover:text-purple-700 transition-colors">
                      {order.items[0]?.product.name} {order.items.length > 1 ? `+ ${order.items.length - 1} more assets` : ''}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Processed: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-4 w-full md:w-auto">
                  <p className="text-3xl font-black italic tracking-tighter">
                    <span className="text-sm not-italic font-bold text-slate-400 mr-1">KSh</span>
                    {order.totalAmount.toLocaleString()}
                  </p>
                  <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    order.paymentStatus === 'SUCCESS' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {order.paymentStatus === 'SUCCESS' ? '• System Confirmed' : '• Pending Sync'}
                  </span>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
                 <Package size={48} className="mx-auto text-slate-200 mb-6" />
                 <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[11px]">Archive Empty: No luxury acquisitions found</p>
                 <Link href="/" className="mt-8 inline-block bg-slate-900 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:shadow-xl transition-all">
                   Begin Exploration
                 </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}