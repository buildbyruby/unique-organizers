import prisma from '@/lib/prisma'
import Link from 'next/link'
import { deleteFeedback } from '../actions'
import { Trash2, MessageSquare, Package, User, LifeBuoy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage(props: {
  searchParams: Promise<{ view?: string }>
}) {
  const searchParams = await props.searchParams;
  const view = searchParams.view || 'orders';
  
  // In production, fetch from session. Using hardcoded admin/client logic for demo.
  const userId = "cml5imk0y0006qlln004m9hzc" 
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isAdmin = user?.role === "ADMIN";
  
  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const feedbacks = isAdmin ? await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } }) : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 p-8 flex flex-col gap-12 hidden lg:flex shrink-0">
        <Link href="/" className="text-xl font-black italic text-white uppercase tracking-tighter">
          Unique <span className="text-pink-500">Org</span>
        </Link>
        <nav className="flex flex-col gap-6">
          <Link href="/dashboard?view=orders" className={`${view === 'orders' ? 'text-pink-500' : 'text-slate-400'} text-xs font-black uppercase tracking-widest flex items-center gap-3`}><Package size={16}/> Orders</Link>
          {isAdmin && (
            <Link href="/dashboard?view=feedback" className={`${view === 'feedback' ? 'text-pink-500' : 'text-slate-400'} text-xs font-black uppercase tracking-widest flex items-center gap-3`}><MessageSquare size={16}/> Feedback</Link>
          )}
          <Link href="/profile" className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white flex items-center gap-3"><User size={16}/> Profile</Link>
          <Link href="/support" className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white flex items-center gap-3"><LifeBuoy size={16}/> Help Desk</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            {isAdmin ? 'Admin' : 'Client'} <span className="text-pink-600">Panel</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
            {view === 'feedback' ? 'Manage global system feedback' : 'Track your luxury acquisitions'}
          </p>
        </header>

        {view === 'orders' && (
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
          </div>
        )}

        {view === 'feedback' && isAdmin && (
          <div className="grid grid-cols-1 gap-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Client Messages</h2>
            {feedbacks.map((msg) => (
              <div key={msg.id} className="bg-white rounded-[2rem] p-8 border border-white shadow-sm flex justify-between items-start gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">{msg.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mb-2">{msg.email}</p>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <form action={async () => { "use server"; await deleteFeedback(msg.id); }}>
                  <button className="p-4 bg-slate-50 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-2xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}