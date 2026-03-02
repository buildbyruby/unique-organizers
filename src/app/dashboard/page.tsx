"use client"
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Heart, User, ArrowUpRight, LogOut, Loader2, MessageSquare, Compass, Truck
} from 'lucide-react';

export default function ClientDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/client/dashboard');
      if (res.status === 401 || res.status === 404) {
        window.location.href = '/login';
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('focus', fetchDashboardData);
    return () => window.removeEventListener('focus', fetchDashboardData);
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleSupport = () => {
    const phone = "254797517565"; 
    const userName = data?.user?.name || 'Valued Client';
    const message = `Hello Unique Organizers! 🚀 This is ${userName}. I'm in my dashboard and would love to discuss my latest orders.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        Establishing_Secure_Link...
      </div>
    );
  }

  const { user = {}, orders = [], wishlist = [] } = data || {};
  const deliverySteps = ['PENDING', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20">
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Client_Terminal</h1>
        </div>
        <button onClick={handleLogout} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">
            Disconnect_Node <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6">
              <User size={30} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{user.name || 'Anonymous_Unit'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.email}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Orders</p>
                <p className="text-xl font-black italic">{orders.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl">
                <p className="text-[8px] font-black text-purple-400 uppercase mb-1">Saved</p>
                <p className="text-xl font-black italic text-purple-600">{wishlist.length}</p>
              </div>
            </div>

            <Link href="/" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center justify-center gap-2 group">
              <Compass size={14} className="group-hover:rotate-45 transition-transform" /> Start_Browsing
            </Link>
          </div>

          <div className="bg-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-2">Priority_Support</h3>
            <p className="text-xs text-purple-100 mb-6 font-medium leading-relaxed">Direct line to logistics and modifications department.</p>
            <button onClick={handleSupport} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                <MessageSquare size={14} /> Open_Communication
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex justify-between items-end mb-6 px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Shipment_Manifest</h3>
                <Link href="/" className="text-[9px] font-black uppercase text-purple-600 underline">Browse_Catalog</Link>
            </div>
            
            <div className="space-y-6">
              {orders.length > 0 ? orders.map((order: any) => {
                const currentStepIndex = deliverySteps.indexOf(order.deliveryStatus || 'PENDING');
                const progressPercentage = (currentStepIndex / (deliverySteps.length - 1)) * 100;

                return (
                  <div key={order.id} className="bg-white border border-slate-100 p-8 rounded-[3rem] group hover:border-purple-300 transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ref: {order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                            {order.deliveryStatus?.replace('_', ' ') || 'PENDING'} 
                            <span className={`w-2 h-2 rounded-full ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                          </p>
                        </div>
                      </div>
                      <Link href={`/track/${order.uniqueOrderLink}`} className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-600 transition-colors flex items-center gap-2">
                        Realtime_Logistics <ArrowUpRight size={14} />
                      </Link>
                    </div>

                    {/* ITEMS IN THIS SHIPMENT */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg overflow-hidden border">
                              <img src={item.product?.images?.[0]} className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <p className="text-[8px] font-black uppercase truncate w-20">{item.product.name}</p>
                              {item.color && (
                                <div className="flex items-center gap-1 mt-0.5">
                                   <div className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: item.color }} />
                                   <span className="text-[7px] font-bold text-slate-400 uppercase">{item.size || 'OS'}</span>
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>

                    {/* PROGRESS TRACKER */}
                    <div className="relative pt-2">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                            <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <div className="flex justify-between px-1">
                            {deliverySteps.map((step, i) => (
                                <div key={step} className={`text-[7px] font-black uppercase tracking-widest ${i <= currentStepIndex ? 'text-purple-600' : 'text-slate-300'}`}>
                                    {step.replace('_', ' ')}
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active shipments found.</p>
                  <Link href="/" className="mt-4 inline-block text-[10px] font-black uppercase text-purple-600 hover:text-purple-800">Start_Your_First_Discovery</Link>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 px-2">Watchlist_Registry</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.length > 0 ? wishlist.map((item: any) => (
                <div key={item.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="aspect-square rounded-3xl bg-slate-50 overflow-hidden mb-4 relative">
                    <img src={item.product?.images?.[0] || 'https://placehold.co/400x400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <Link href={`/product/${item.product.id}`} className="w-full py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-xl text-center">Open_Asset</Link>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-black uppercase truncate mb-1">{item.product.name}</h4>
                  <p className="text-[10px] font-black text-purple-600 italic">KSh {item.product.retailPrice.toLocaleString()}</p>
                </div>
              )) : (
                <div className="col-span-full py-10 bg-white border border-slate-100 rounded-[2.5rem] text-center shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Registry_Empty</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}