import prisma from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  // Hardcoded for demo; in production, we pull from session (e.g. NextAuth)
  const userId = "cml5imk0y0006qlln004m9hzc" 
  
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 p-8 flex flex-col gap-12 hidden lg:flex">
        <Link href="/" className="text-xl font-black italic text-white uppercase tracking-tighter">
          Unique <span className="text-pink-500">Org</span>
        </Link>
        <nav className="flex flex-col gap-6">
          <Link href="/dashboard" className="text-pink-500 text-xs font-black uppercase tracking-widest">Orders</Link>
          <Link href="/profile" className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white">Profile</Link>
          <Link href="/support" className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white">Help Desk</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Client <span className="text-pink-600">Panel</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Track your luxury acquisitions</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Order History</h2>
          
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2rem] p-8 border border-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex gap-6 items-center">
                <div className="h-16 w-16 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl">📦</div>
                <div>
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">{order.accountReference}</p>
                  <p className="font-black text-slate-900 uppercase tracking-tighter">{order.items[0]?.product.name} {order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}</p>
                  <p className="text-xs text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-2xl font-black italic">KSh {order.totalAmount.toLocaleString()}</p>
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  order.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-500'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
               <p className="text-slate-300 font-black uppercase tracking-widest">You haven't made any orders yet</p>
               <Link href="/" className="mt-4 inline-block text-pink-500 font-black text-[10px] underline uppercase">Start Shopping</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}