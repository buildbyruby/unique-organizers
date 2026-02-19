"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, ExternalLink, Trash2, Loader2, LayoutGrid, ImagePlus, ChevronDown, CheckCircle2 } from 'lucide-react';
import { updateProductCategory } from '@/app/actions';

const COLOR_PRESETS = [
  { label: 'Midnight', hex: '#000000' },
  { label: 'Crystal', hex: '#FFFFFF' },
  { label: 'Frosted', hex: '#F3F4F6' },
  { label: 'Gold', hex: '#D4AF37' },
  { label: 'Acrylic', hex: '#E0F2FE' }
];

// ADDED "LUXURY GIFTS" TO THE TOP OF THE LIST
const CATEGORY_OPTIONS = [
  { name: "Luxury Gifts", slug: "GIFTS" }, 
  { name: "Kitchen & Dining", slug: "KITCHEN" },
  { name: "Home & Living", slug: "HOME_LIVING" },
  { name: "Electronics", slug: "ELECTRONICS" },
  { name: "Clothing & Apparel", slug: "CLOTHING" },
  { name: "Beauty & Personal Care", slug: "BEAUTY" },
  { name: "Grocery & Food", slug: "GROCERY" },
  { name: "Toys & Baby", slug: "TOYS" },
  { name: "Sports & Outdoors", slug: "SPORTS" },
  { name: "Automotive Elite", slug: "AUTOMOTIVE" },
  { name: "Pet Supplies", slug: "PETS" },
  { name: "Tools & Hardware", slug: "TOOLS" },
  { name: "Office Supplies", slug: "OFFICE" },
  { name: "Health & Wellness", slug: "HEALTH" },
  { name: "Entertainment", slug: "ENTERTAINMENT" },
  { name: "Garden & Outdoor", slug: "GARDEN" },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '', description: '', retailPrice: '', wholesalePrice: '', 
    category: CATEGORY_OPTIONS[0].slug,
    stock: '20', minWholesale: '5', 
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

  const handleCategoryChange = async (productId: string, newCategory: string) => {
    setUpdatingId(productId);
    const result = await updateProductCategory(productId, newCategory);
    if (result.success) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, category: newCategory } : p));
    }
    setTimeout(() => setUpdatingId(null), 1000);
  };

  const openCloudinary = () => {
    // @ts-ignore
    if(typeof window !== 'undefined' && window.cloudinary) {
      // @ts-ignore
      const widget = window.cloudinary.createUploadWidget({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, 
      }, (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const newUrl = result.info.secure_url;
          setForm(prev => ({ ...prev, images: prev.images ? prev.images + `, ${newUrl}` : newUrl }));
        }
      });
      widget.open();
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

    setForm({ ...form, name: '', description: '', retailPrice: '', wholesalePrice: '', images: '', colors: [] });
    refreshData();
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Erase this asset from the database?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black gap-4">
      <Loader2 className="animate-spin text-purple-600" size={40} />
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Accessing Secure Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Authenticated</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic">Command <span className="text-purple-600">Center</span></h1>
        </div>
        <Link href="/" className="px-6 py-3 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center gap-2 shadow-xl shadow-black/10">
          <ExternalLink size={14} /> Exit Storefront
        </Link>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2.5rem] h-fit lg:sticky lg:top-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-black">
            <Plus size={16} className="text-purple-600" /> New Asset Deployment
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Asset Identity</label>
              <input placeholder="Product Title" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs focus:border-purple-500 transition-all outline-none font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">System Category</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:border-purple-500 transition-all cursor-pointer"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <textarea placeholder="Technical Description..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs h-24 outline-none focus:border-purple-500 font-medium" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Retail (KSh)</label>
                 <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs outline-none focus:border-purple-500 font-bold" value={form.retailPrice} onChange={e => setForm({...form, retailPrice: e.target.value})} required />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-purple-600 px-1">Wholesale</label>
                 <input type="number" className="w-full bg-purple-50 border border-purple-100 rounded-2xl p-4 text-xs font-black text-purple-600 outline-none focus:border-purple-500" value={form.wholesalePrice} onChange={e => setForm({...form, wholesalePrice: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-3 p-5 bg-slate-50 border border-slate-100 rounded-3xl">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Visual Variants</label>
              <div className="flex flex-wrap gap-4">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    type="button" key={preset.hex} onClick={() => toggleColor(preset.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-all shadow-sm ${form.colors.includes(preset.hex) ? 'border-purple-600 scale-125' : 'border-slate-200 opacity-60'}`}
                    style={{ backgroundColor: preset.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Media Archive</label>
              <div className="relative group">
                <input placeholder="Image URLs..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-[10px] font-bold outline-none focus:border-purple-500" value={form.images} onChange={e => setForm({...form, images: e.target.value})} required />
                <button type="button" onClick={openCloudinary} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 hover:text-black p-2">
                  <ImagePlus size={18}/>
                </button>
              </div>
            </div>

            <button disabled={formLoading} className="w-full bg-purple-600 hover:bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-200 active:scale-95">
              {formLoading ? 'Executing Upload...' : 'Push Asset to Store'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black">
              <LayoutGrid size={16} className="text-purple-600" /> Active Inventory
            </h3>
            <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
              {products.length} Assets Online
            </div>
          </div>
          
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="p-5 bg-white hover:bg-slate-50 border border-slate-100 rounded-[2rem] transition-all flex items-center gap-6 group shadow-sm">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px] font-black italic uppercase">Null</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <select 
                      className="text-[8px] font-black text-purple-500 uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer hover:text-purple-700 transition-colors"
                      value={product.category}
                      onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.slug} value={opt.slug}>{opt.name.toUpperCase()}</option>
                      ))}
                    </select>
                    {updatingId === product.id && <Loader2 size={10} className="animate-spin text-purple-500" />}
                    {updatingId === product.id && <CheckCircle2 size={10} className="text-green-500 animate-pulse" />}
                  </div>
                  <h4 className="text-sm font-black text-black group-hover:text-purple-600 transition-colors uppercase tracking-tight truncate">{product.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] font-bold text-slate-400">KSh {product.retailPrice.toLocaleString()}</p>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-[10px] font-black text-black uppercase">Stock: {product.stock}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(product.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
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