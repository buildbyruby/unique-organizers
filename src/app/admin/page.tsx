"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, ExternalLink, ShieldCheck, Trash2, Loader2, Check, LayoutGrid, ImagePlus } from 'lucide-react';

// Premium Visual Color Presets - No more typing hex codes
const COLOR_PRESETS = [
  { label: 'Midnight', hex: '#000000' },
  { label: 'Crystal', hex: '#FFFFFF' },
  { label: 'Frosted', hex: '#F3F4F6' },
  { label: 'Gold', hex: '#D4AF37' },
  { label: 'Acrylic', hex: '#E0F2FE' }
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '', description: '', retailPrice: '', wholesalePrice: '', 
    category: 'ORGANIZERS', stock: '20', minWholesale: '5', 
    images: '', colors: [] as string[]
  });

  const refreshData = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  // Cloudinary Integration Hook
  const openCloudinary = () => {
    // @ts-ignore
    if(typeof window !== 'undefined' && window.cloudinary) {
      // @ts-ignore
      const widget = window.cloudinary.createUploadWidget({
        cloudName: 'demo', // REPLACE WITH YOUR CLOUDINARY CLOUD NAME LATER
        uploadPreset: 'default-preset', // REPLACE LATER
      }, (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const newUrl = result.info.secure_url;
          setForm(prev => ({ ...prev, images: prev.images ? prev.images + `, ${newUrl}` : newUrl }));
        }
      });
      widget.open();
    } else {
      alert("Cloudinary script loading. If you haven't set up keys, use the URL input box below.");
    }
  };

  const toggleColor = (hex: string) => {
    setForm(prev => {
      const exists = prev.colors.includes(hex);
      return { ...prev, colors: exists ? prev.colors.filter(c => c !== hex) : [...prev.colors, hex] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const payload = {
      ...form,
      images: form.images.split(',').map(s => s.trim()).filter(s => s !== ""),
      retailPrice: parseFloat(form.retailPrice),
      wholesalePrice: parseFloat(form.wholesalePrice),
      stock: parseInt(form.stock),
      minWholesale: parseInt(form.minWholesale)
    };

    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setForm({ name: '', description: '', retailPrice: '', wholesalePrice: '', category: 'ORGANIZERS', stock: '20', minWholesale: '5', images: '', colors: [] });
    refreshData();
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Erase this asset from the database?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <Loader2 className="animate-spin text-purple-500" size={40} />
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Accessing Secure Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020203] text-slate-200 p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} className="text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Encrypted Session</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
            Command <span className="text-purple-500">Center</span>
          </h1>
        </div>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
          <ExternalLink size={14} /> Exit to Store
        </Link>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* ADD PRODUCT FORM */}
        <div className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[2.5rem] h-fit sticky top-24 shadow-2xl">
          <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
            <Plus size={18} className="text-purple-500" /> Deploy Asset
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Product Title" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:border-purple-500 transition-colors" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <textarea placeholder="Product Description..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs h-20" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">Retail (KSh)</label>
                 <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs" value={form.retailPrice} onChange={e => setForm({...form, retailPrice: e.target.value})} required />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-purple-400 px-1">Wholesale (KSh)</label>
                 <input type="number" className="w-full bg-white/5 border border-purple-500/30 rounded-xl p-3 text-xs font-bold text-purple-400" value={form.wholesalePrice} onChange={e => setForm({...form, wholesalePrice: e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Total Stock" className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
              <input type="number" placeholder="Min. Wholesale Qty" className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs" value={form.minWholesale} onChange={e => setForm({...form, minWholesale: e.target.value})} required />
            </div>

            {/* VISUAL COLOR PICKER */}
            <div className="space-y-2 p-4 bg-white/5 border border-white/10 rounded-xl">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Available Variants</label>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    type="button" key={preset.hex} onClick={() => toggleColor(preset.hex)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${form.colors.includes(preset.hex) ? 'border-purple-500 scale-110 shadow-lg' : 'border-white/20 opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.label}
                  >
                    {form.colors.includes(preset.hex) && <Check size={14} className={preset.hex === '#FFFFFF' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>

            {/* HYBRID IMAGE UPLOAD */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex justify-between">
                <span>Media Source</span>
                <button type="button" onClick={openCloudinary} className="text-purple-400 hover:text-white flex items-center gap-1"><ImagePlus size={10}/> Cloud Upload</button>
              </label>
              <input placeholder="Or paste URLs separated by commas..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-mono" value={form.images} onChange={e => setForm({...form, images: e.target.value})} required />
            </div>

            <button disabled={formLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-900/20 active:scale-95">
              {formLoading ? 'Executing Deploy...' : 'Push to Live Store'}
            </button>
          </form>
        </div>

        {/* LIVE INVENTORY FEED */}
        <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
              <LayoutGrid size={18} className="text-purple-500" /> Active Roster
            </h3>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">{products.length} Items</span>
          </div>
          
          <div className="divide-y divide-white/5">
            {products.map((product) => (
              <div key={product.id} className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center gap-6 group">
                <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 relative">
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight italic">{product.name}</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <p className="text-[10px] font-mono text-slate-400 uppercase">R: KSh {product.retailPrice.toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-purple-400 font-bold uppercase">W: KSh {product.wholesalePrice.toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-emerald-500 uppercase">Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {product.colors?.map((c: string) => (
                      <div key={c} className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all self-end sm:self-center"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}