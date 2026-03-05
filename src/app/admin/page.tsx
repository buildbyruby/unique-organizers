"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Plus, Trash2, Loader2, LayoutGrid, CheckCircle2, 
  MessageSquare, Star, TrendingUp, Power, Link as LinkIcon, 
  Truck, BarChart3, ImagePlus, RefreshCcw, ExternalLink,
  Tag, Landmark, Percent, Layers, Smartphone, Edit3, X, 
  ShoppingBag, Clock, User, ArrowRight, ShieldCheck
} from 'lucide-react';
import { 
  toggleProductStock, deleteProduct, 
  deleteFeedback, getDashboardData 
} from '@/app/admin/actions';

// --- SYSTEM CONSTANTS ---
const COLOR_PRESETS = [
  { label: 'Midnight', hex: '#000000' },
  { label: 'Crystal', hex: '#FFFFFF' },
  { label: 'Frosted', hex: '#F3F4F6' },
  { label: 'Gold', hex: '#D4AF37' },
  { label: 'Acrylic', hex: '#E0F2FE' }
];

const CATEGORY_MAP: Record<string, string[]> = {
  KITCHEN: ["Lighting", "Storage & Organizers", "Home Accessories", "Cookware", "Plates & Dining"],
  HOME_LIVING: ["Decor", "Furniture", "Rugs", "Bedding"],
  GIFTS: ["Corporate", "Birthday", "Wedding", "Luxury Hampers"],
  ELECTRONICS: ["Audio", "Gadgets", "Smart Home", "Office Gear"],
  CLOTHING: ["Men", "Women", "Kids", "Accessories"],
  BEAUTY: ["Skincare", "Makeup", "Fragrance"],
  GROCERY: ["Dry Goods", "Beverages", "Spices"],
  TOOLS: ["Hand Tools", "Power Tools", "Organizers"]
};

const formatNumber = (num: string | number | null | undefined) => {
  if (num === null || num === undefined || num === '') return '0';
  const parsed = Number(String(num).replace(/,/g, ''));
  return isNaN(parsed) ? '0' : parsed.toLocaleString('en-US');
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getDashboardData();
      setProducts(data.products || []);
      setFeedbacks(data.feedbacks || []);
      setOrders(data.orders || []);
      setPerformance(data.performance);
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const handleToggleStock = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    await toggleProductStock(id, !currentStatus);
    await refreshData();
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Erase product? This action is permanent.')) return;
    await deleteProduct(id);
    refreshData();
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    await deleteFeedback(id);
    refreshData();
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <Loader2 className="animate-spin text-purple-600 mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-[10px] text-black">Accessing Secure Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-10 font-sans antialiased">
      {/* --- PERFORMANCE BOARD --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black uppercase text-slate-800 mb-2 tracking-widest">Total Revenue</p>
          <h2 className="text-3xl font-black italic text-black">KSh {formatNumber(performance?.revenue || 0)}</h2>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 w-[70%]" />
          </div>
        </div>
        <div className="bg-black p-8 rounded-[2.5rem] text-white shadow-xl shadow-black/10">
          <p className="text-[10px] font-black uppercase text-slate-300 mb-2 tracking-widest">Total Orders</p>
          <h2 className="text-3xl font-black italic">{formatNumber(performance?.orders || 0)}</h2>
          <BarChart3 size={20} className="mt-4 text-purple-500" />
        </div>
        <div className="bg-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-900/20">
          <p className="text-[10px] font-black uppercase text-purple-100 mb-2 tracking-widest">Inventory Assets</p>
          <h2 className="text-3xl font-black italic">{formatNumber(performance?.inventory || 0)}</h2>
          <Package size={20} className="mt-4 text-white/50" />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col justify-center items-center text-center">
          <TrendingUp size={32} className="text-emerald-500 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">System: Optimal</p>
        </div>
      </section>

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic leading-none">Command <span className="text-purple-600">Center</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800 mt-2">Boutique Management Suite v2.3</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={refreshData} className="p-3 bg-white border border-slate-300 rounded-full hover:bg-slate-100 transition-all active:rotate-180">
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <Link href="/" className="px-6 py-3 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center gap-2 shadow-xl active:scale-95">
            <ExternalLink size={14} /> View Storefront
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10">
        
        {/* --- LEFT COLUMN: QUICK ACTIONS --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] flex items-center gap-3 text-black mb-8 border-b border-slate-50 pb-4">
              <Power size={16} className="text-purple-600" />
              Quick Actions
            </h3>
            
            <div className="flex flex-col gap-5">
              <Link href="/admin/dashboard" className="group flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-black hover:text-white transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-purple-600 transition-colors shrink-0">
                  <Package size={24} className="text-purple-600 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <span className="block text-[12px] font-black uppercase tracking-widest mb-1">Product Manager</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-300">Manage Assets</span>
                </div>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>

              <Link href="/admin/orders" className="group flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-black hover:text-white transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-purple-600 transition-colors shrink-0">
                  <ShoppingBag size={24} className="text-purple-600 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <span className="block text-[12px] font-black uppercase tracking-widest mb-1">Logistics Hub</span>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-300">Track Shipments</span>
                </div>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-purple-900/20">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Health</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Cloudinary API</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-400/10 px-3 py-1 rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Database Node</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-400/10 px-3 py-1 rounded-full">Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ACTIVE ASSETS --- */}
        <div className="lg:col-span-8 space-y-12">
          
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-900 px-4 leading-none"><LayoutGrid size={14} /> Active Archives</h3>
            <div className="grid gap-5">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <img src={product.images[0]} className="w-24 h-24 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 bg-slate-100" />
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${product.isStockOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-black uppercase tracking-tight line-clamp-1">{product.name}</h4>
                      
                      <div className="flex flex-col gap-1.5 mt-3">
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500 uppercase border border-slate-200">{product.category}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] bg-purple-50 px-3 py-1 rounded-full font-black text-purple-600 uppercase border border-purple-100 w-fit">Retail: KSh {formatNumber(product.retailPrice)}</span>
                          <span className="text-[9px] bg-pink-50 px-3 py-1 rounded-full font-black text-pink-600 uppercase border border-pink-100 w-fit">Bulk: KSh {formatNumber(product.wholesalePrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                    <Link href={`/admin/dashboard?edit=${product.id}`} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-800 hover:text-amber-600 rounded-2xl transition-all border border-slate-100 hover:bg-amber-50">
                      <Edit3 size={18} />
                    </Link>
                    <button onClick={() => handleToggleStock(product.id, product.isStockOpen)} disabled={updatingId === product.id} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${product.isStockOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {updatingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />} {product.isStockOpen ? 'Live' : 'Offline'}
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all border border-slate-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <Link href="/admin/dashboard" className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 hover:text-purple-600 transition-all group">
                Refresh Active Inventory Assets <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

          {/* --- RECENT ORDERS --- */}
          <section className="space-y-6">
             <div className="flex items-center justify-between px-4">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-900 leading-none"><ShoppingBag size={14} /> Recent Orders</h3>
               <Link href="/admin/orders" className="text-[9px] font-black uppercase text-purple-600 hover:text-purple-700 tracking-widest">View All</Link>
             </div>
             <div className="bg-white border border-slate-200 rounded-[3rem] p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Order Ref</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-xs font-black text-black">#{order.id.slice(-6).toUpperCase()}</td>
                        <td className="p-4 text-xs font-bold text-slate-700">KSh {formatNumber(order.totalAmount)}</td>
                        <td className="p-4">
                          <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}