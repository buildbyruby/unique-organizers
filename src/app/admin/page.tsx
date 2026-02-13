"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, ShoppingBag, Users, TrendingUp, Plus, 
  ExternalLink, ChevronRight, Clock, ShieldCheck, Trash2, LayoutGrid, Loader2
} from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    name: '', description: '', retailPrice: '', wholesalePrice: '', 
    category: 'ELECTRONICS', stock: '10', minWholesale: '3', 
    images: '', colors: '' 
  });

  // Load Data from our API
  const refreshData = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      
      // Calculate basic stats from the product list for now
      setStats([
        { label: 'Total Value', value: `KSh ${data.reduce((a:any, b:any) => a + b.retailPrice, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Products', value: data.length, icon: Package, color: 'text-purple-400' },
        { label: 'In Stock', value: data.reduce((a:any, b:any) => a + b.stock, 0), icon: LayoutGrid, color: 'text-blue-400' },
        { label: 'System Status', value: 'Active', icon: ShieldCheck, color: 'text-pink-400' },
      ]);
    } catch (e) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const payload = {
      ...form,
      images: form.images.split(',').map(s => s.trim()).filter(s => s !== ""),
      colors: form.colors.split(',').map(s => s.trim()).filter(s => s !== "")
    };

    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setForm({ name: '', description: '', retailPrice: '', wholesalePrice: '', category: 'ELECTRONICS', stock: '10', minWholesale: '3', images: '', colors: '' });
    refreshData();
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this asset record?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="animate-spin text-purple-500" size={40} />
      <p className="font-black uppercase tracking-widest text-[10px]">Syncing Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020203] text-slate-200 p-4 md:p-8">
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats?.map((stat: any, i: number) => (
            <div key={i} className="bg-[#0a0a0c] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
              <stat.icon className={`${stat.color} mb-4`} size={24} />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ADD PRODUCT FORM */}
          <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[2.5rem] h-fit sticky top-24">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Plus size={18} className="text-purple-500" /> Deploy New Asset
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs h-20" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Retail KSh" className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs" value={form.retailPrice} onChange={e => setForm({...form, retailPrice: e.target.value})} required />
                <input type="number" placeholder="Stock" className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Image URL</label>
                <input placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono" value={form.images} onChange={e => setForm({...form, images: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hex Colors (#000000, #8A2BE2)</label>
                <input placeholder="#hex, #hex" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono" value={form.colors} onChange={e => setForm({...form, colors: e.target.value})} />
              </div>

              <button disabled={formLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                {formLoading ? 'Executing...' : 'Push to Live Store'}
              </button>
            </form>
          </div>

          {/* PRODUCT LIST (LIVE INVENTORY) */}
          <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Package size={18} className="text-purple-500" /> Live Catalog
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{products.length} Assets Active</span>
            </div>
            
            <div className="divide-y divide-white/5">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-white/10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{product.name}</h4>
                    <div className="flex gap-4 mt-1">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">KSh {product.retailPrice.toLocaleString()}</p>
                      <p className="text-[10px] font-mono text-emerald-500 uppercase">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
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