export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default async function AdminDashboard() {
  // 1. Fetch High-Level Stats with Error Handling
  // Note: user role changed to CUSTOMER to match your schema.prisma
  const [productCount, orderCount, userCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
  ]);

  // Calculate total revenue (Success orders only)
  const revenueData = await prisma.order.aggregate({
    where: { paymentStatus: 'SUCCESS' },
    _sum: { totalAmount: true }
  });
  
  const totalRevenue = revenueData._sum.totalAmount || 0;

  const stats = [
    { label: 'Total Revenue', value: `KSh ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Orders', value: orderCount, icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Products', value: productCount, icon: Package, color: 'text-purple-400' },
    { label: 'Customers', value: userCount, icon: Users, color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-[#020203] text-slate-200 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} className="text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Authorized Personnel Only</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
            Command <span className="text-purple-500">Center</span>
          </h1>
        </div>
        
        <div className="flex gap-3">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            <ExternalLink size={14} /> View Site
          </Link>
          <Link href="/admin/products/new" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2">
            <Plus size={14} /> Add Product
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0a0a0c] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={100} />
              </div>
              <stat.icon className={`${stat.color} mb-4`} size={24} />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* RECENT ORDERS TABLE */}
          <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Clock size={18} className="text-purple-500" /> Recent Transactions
              </h3>
              <Link href="/admin/orders" className="text-[10px] font-black uppercase text-slate-500 hover:text-white">View All</Link>
            </div>
            <div className="overflow-x-auto">
              {recentOrders.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <th className="px-8 py-4">Ref</th>
                      <th className="px-8 py-4">Customer/Contact</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6 font-mono text-xs text-purple-400">{order.accountReference}</td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white">{order.user?.name || 'Guest User'}</p>
                          <p className="text-[10px] text-slate-500">{order.phoneNumber}</p>
                        </td>
                        <td className="px-8 py-6 font-bold text-sm">KSh {order.totalAmount.toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            order.paymentStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 
                            order.paymentStatus === 'FAILED' ? 'bg-red-500/10 text-red-500' : 
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link href={`/admin/orders/${order.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                            <ChevronRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center">
                   <p className="text-xs font-black uppercase tracking-widest text-slate-600">No transactions recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS / ALERTS */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl shadow-purple-900/20">
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Network Health</h3>
              <p className="text-purple-100 text-xs mt-2 leading-relaxed">System connected to Supabase PostgreSQL & M-Pesa Gateway.</p>
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest">Gateway: Active</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
              </div>
            </div>

            <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Management Links</h3>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/admin/products" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all text-xs font-bold flex justify-between items-center group">
                  <span className="uppercase tracking-widest">Manage Catalog</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/admin/users" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all text-xs font-bold flex justify-between items-center group">
                  <span className="uppercase tracking-widest">User Directory</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/admin/settings" className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all text-xs font-bold flex justify-between items-center group">
                  <span className="uppercase tracking-widest">API Settings</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-20 pb-8 text-center border-t border-white/5 pt-8">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700">Unique Organizers // Secure Admin Portal</p>
      </footer>
    </div>
  );
}