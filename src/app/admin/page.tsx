"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, ExternalLink, Trash2, Loader2, LayoutGrid, ImagePlus, ChevronDown, CheckCircle2, MessageSquare, Star, ShieldCheck, RefreshCcw } from 'lucide-react';
import { updateProductCategory } from '@/app/actions';

const COLOR_PRESETS = [
  { label: 'Midnight', hex: '#000000' },
  { label: 'Crystal', hex: '#FFFFFF' },
  { label: 'Frosted', hex: '#F3F4F6' },
  { label: 'Gold', hex: '#D4AF37' },
  { label: 'Acrylic', hex: '#E0F2FE' }
];

const CATEGORY_OPTIONS = [
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [form, setForm] = useState({
    name: '', description: '', retailPrice: '', wholesalePrice: '', 
    category: CATEGORY_OPTIONS[0].slug,
    stock: '20', minWholesale: '5', 
    images: '', colors: [] as string[]
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [prodRes, revRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/reviews')
      ]);
      const prodData = await prodRes.json();
      const revData = await revRes.json();
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setReviews(Array.isArray(revData) ? revData : []);
    } catch (e) {
      console.error("Sync error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
    if (!confirm('Erase product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p.id !== id));
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Permanently delete review?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    setReviews(reviews.filter(r => r.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-purple-600 mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-[10px]">Accessing Secure Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Live</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic">Command <span className="text-purple-600">Center</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={refreshData} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-all">
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <Link href="/" className="px-6 py-3 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all flex items-center gap-2 shadow-xl shadow-black/10">
            <ExternalLink size={14} /> Exit Storefront
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
        
        {/* ADD ASSET COLUMN */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] h-fit lg:sticky lg:top-8 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-black">
            <Plus size={16} className="text-purple-600" /> New Deployment
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Name</label>
              <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <textarea placeholder="Description" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="number" placeholder="Retail Price" className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold" value={form.retailPrice} onChange={e => setForm({...form, retailPrice: e.target.value})} required />
               <input type="number" placeholder="Wholesale" className="w-full min-w-0 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-4 text-sm font-black text-purple-600" value={form.wholesalePrice} onChange={e => setForm({...form, wholesalePrice: e.target.value})} required />
            </div>

            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-3xl">
              {COLOR_PRESETS.map((preset) => (
                <button type="button" key={preset.hex} onClick={() => toggleColor(preset.hex)} className={`w-7 h-7 rounded-full border-2 ${form.colors.includes(preset.hex) ? 'border-purple-600 scale-110' : 'border-white'}`} style={{ backgroundColor: preset.hex }} />
              ))}
            </div>

            <div className="relative">
              <input placeholder="Image URL" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[10px] pr-12" value={form.images} onChange={e => setForm({...form, images: e.target.value})} required />
              <button type="button" onClick={openCloudinary} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600"><ImagePlus size={18}/></button>
            </div>

            <button disabled={formLoading} className="w-full bg-purple-600 hover:bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              {formLoading ? 'Processing...' : 'Deploy Asset'}
            </button>
          </form>
        </div>

        {/* LIST COLUMN */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* INVENTORY */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black px-4">
              <LayoutGrid size={16} className="text-purple-600" /> Inventory ({products.length})
            </h3>
            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="p-4 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-6 shadow-sm group">
                  <img src={product.images?.[0] || '/placeholder-product.jpg'} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <select 
                        className="text-[8px] font-black text-purple-500 uppercase tracking-widest bg-transparent"
                        value={product.category}
                        onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                      >
                        {CATEGORY_OPTIONS.map(opt => (
                          <option key={opt.slug} value={opt.slug}>{opt.name.toUpperCase()}</option>
                        ))}
                      </select>
                      {updatingId === product.id && <Loader2 size={10} className="animate-spin text-purple-500" />}
                    </div>
                    <h4 className="text-sm font-black text-black uppercase">{product.name}</h4>
                  </div>
                  <button onClick={() => handleDelete(product.id)} className="p-4 text-slate-300 hover:text-red-500"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black px-4">
              <MessageSquare size={16} className="text-purple-600" /> Feedback Log ({reviews.length})
            </h3>
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex text-amber-400 mb-2 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                    </div>
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">{review.name}</span>
                    <p className="text-xs text-slate-500 mt-1 italic leading-relaxed font-medium">"{review.comment}"</p>
                  </div>
                  {/* RED TRASH FOR REVIEWS */}
                  <button onClick={() => handleDeleteReview(review.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}