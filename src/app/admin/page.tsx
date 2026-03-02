"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Plus, Trash2, Loader2, LayoutGrid, CheckCircle2, 
  MessageSquare, Star, TrendingUp, Power, Link as LinkIcon, 
  Truck, BarChart3, ImagePlus, RefreshCcw, ExternalLink,
  Tag, Landmark, Percent, Layers, Smartphone, Edit3, X, 
  ShoppingBag, Clock, User
} from 'lucide-react';
import { 
  toggleProductStock, upsertProduct, deleteProduct, 
  deleteFeedback, getDashboardData 
} from '@/app/admin/actions';

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

// Formatter to add commas for display
const formatNumber = (num: string | number | null | undefined) => {
  if (num === null || num === undefined || num === '') return '';
  const parsed = Number(String(num).replace(/,/g, ''));
  return isNaN(parsed) ? '' : parsed.toLocaleString('en-US');
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const initialForm = {
    id: '', name: '', description: '', categoryDescription: '', 
    retailPrice: '', wholesalePrice: '', discountPrice: '', minWholesale: '5',
    category: 'KITCHEN', subCategory: 'Lighting',
    stock: '20', gender: 'UNISEX', sizes: '',
    images: '', colors: [] as string[], isStockOpen: 'true'
  };

  const [form, setForm] = useState(initialForm);

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

  const handleEdit = (product: any) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      categoryDescription: product.categoryDescription || '',
      retailPrice: formatNumber(product.retailPrice),
      wholesalePrice: formatNumber(product.wholesalePrice),
      discountPrice: product.discountPrice ? formatNumber(product.discountPrice) : '',
      minWholesale: formatNumber(product.minWholesale),
      category: product.category,
      subCategory: product.subCategory || CATEGORY_MAP[product.category]?.[0] || '',
      stock: formatNumber(product.stock),
      gender: product.gender || 'UNISEX',
      sizes: product.sizes?.join(', ') || '',
      images: product.images?.join(', ') || '',
      colors: product.colors || [],
      isStockOpen: product.isStockOpen.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handles input formatting securely (strips letters, allows commas)
  const handleNumberInput = (key: string, value: string) => {
    // Only allow numbers and decimal points
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    if (cleanValue === '') {
       setForm(prev => ({ ...prev, [key]: '' }));
       return;
    }
    
    // Check if it's a valid number format before setting
    if (!isNaN(Number(cleanValue))) {
        // Format it nicely for the UI state
        setForm(prev => ({ ...prev, [key]: formatNumber(cleanValue) }));
    }
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
    
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'colors') return; 
      formData.append(key, String(value)); 
    });
    form.colors.forEach(color => formData.append('colors', color));

    const res = await upsertProduct(formData);
    if (res.success) {
      setForm(initialForm);
      refreshData();
    }
    setFormLoading(false);
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
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col justify-center items-center">
          <TrendingUp size={32} className="text-emerald-500 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">System: Optimal</p>
        </div>
      </section>

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
        {/* --- FORM SECTION --- */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 md:p-10 rounded-[3rem] h-fit lg:sticky lg:top-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black leading-none">
              {form.id ? <Edit3 size={16} className="text-amber-500" /> : <Plus size={16} className="text-purple-600" />} 
              {form.id ? 'Modify Asset' : 'New Deployment'}
            </h3>
            {form.id && (
              <button type="button" onClick={() => setForm(initialForm)} className="flex items-center gap-1 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-all">
                <X size={10} /> Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="id" value={form.id} />

            {/* PRODUCT NAME */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Asset Name</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-600 focus:bg-white outline-none text-black transition-all" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="e.g. PREMIUM ACRYLIC DRAWER"
                required 
              />
            </div>

            {/* CATEGORIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Main Node</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[10px] font-black text-black appearance-none outline-none focus:ring-2 focus:ring-purple-600" value={form.category} onChange={e => setForm({...form, category: e.target.value, subCategory: CATEGORY_MAP[e.target.value]?.[0] || ''})}>
                    {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Sub Tag</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[10px] font-black text-black appearance-none outline-none focus:ring-2 focus:ring-purple-600" value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})}>
                    {CATEGORY_MAP[form.category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Category Insight (Description)</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:bg-white outline-none text-black transition-all min-h-[100px]" 
                value={form.categoryDescription} 
                onChange={e => setForm({...form, categoryDescription: e.target.value})} 
                placeholder="Describe the category's purpose or specific collection details..."
              />
            </div>

            {/* PRICING ARCHITECTURE - FIX: Stacked vertically so numbers are readable and fully wide */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={14} className="text-purple-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Pricing Matrix</span>
              </div>
              
              <div className="flex flex-col gap-5">
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col w-full">
                   <label className="text-[10px] font-black uppercase text-purple-400 mb-2">Retail Price (KSh)</label>
                   <input type="text" className="bg-transparent border-none p-0 w-full text-2xl font-black text-white outline-none placeholder:text-white/20" 
                    value={form.retailPrice} onChange={e => handleNumberInput('retailPrice', e.target.value)} placeholder="1,000" required />
                 </div>
                 
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col w-full">
                   <label className="text-[10px] font-black uppercase text-pink-400 mb-2">Wholesale / Bulk Price (KSh)</label>
                   <input type="text" className="bg-transparent border-none p-0 w-full text-2xl font-black text-white outline-none placeholder:text-white/20" 
                    value={form.wholesalePrice} onChange={e => handleNumberInput('wholesalePrice', e.target.value)} placeholder="0" />
                 </div>

                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col w-full">
                   <label className="text-[10px] font-black uppercase text-amber-400 mb-2">Discount / Sale Price (KSh)</label>
                   <input type="text" className="bg-transparent border-none p-0 w-full text-2xl font-black text-white outline-none placeholder:text-white/20" 
                    value={form.discountPrice} onChange={e => handleNumberInput('discountPrice', e.target.value)} placeholder="Optional" />
                 </div>
              </div>
            </div>

            {/* INVENTORY & ATTR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Stock Units</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none text-black" 
                  value={form.stock} onChange={e => handleNumberInput('stock', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Bulk MOQ</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none text-black" 
                  value={form.minWholesale} onChange={e => handleNumberInput('minWholesale', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Gender Target</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[10px] font-black text-black appearance-none outline-none focus:ring-2 focus:ring-purple-600" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="UNISEX">UNISEX</option><option value="MEN">MEN</option><option value="WOMEN">WOMEN</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Sizes (CSV)</label>
                <input placeholder="S, M, L, XL" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-bold outline-none text-black uppercase" value={form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Color Attributes</label>
              <div className="flex flex-wrap gap-3 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                {COLOR_PRESETS.map((preset) => (
                  <button type="button" key={preset.hex} onClick={() => toggleColor(preset.hex)} className={`w-10 h-10 rounded-full border-4 transition-all ${form.colors.includes(preset.hex) ? 'border-purple-600 scale-110 shadow-lg' : 'border-white'}`} style={{ backgroundColor: preset.hex }} title={preset.label} />
                ))}
              </div>
            </div>

            <div className="relative space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Media Assets</label>
              <div className="relative">
                <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[9px] font-bold pr-16 outline-none text-black truncate focus:ring-2 focus:ring-purple-600" value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="Cloudinary URLs (comma separated)..." required />
                <button type="button" onClick={openCloudinary} className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-600 hover:scale-110 transition-transform"><ImagePlus size={24}/></button>
              </div>
            </div>

            <button disabled={formLoading} className={`w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 disabled:opacity-50 ${form.id ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-900/10' : 'bg-black text-white hover:bg-purple-600 shadow-purple-900/10'}`}>
              {formLoading ? 'PROCESSING TRANSACTION...' : form.id ? 'CONFIRM CHANGES' : 'DEPLOY ASSET TO LIVE'}
            </button>
          </form>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* --- ACTIVE ARCHIVES --- */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-900 px-4 leading-none"><LayoutGrid size={14} /> Active Archives</h3>
            <div className="grid gap-5">
              {products.map((product) => (
                <div key={product.id} className="p-6 sm:p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <img src={product.images[0]} className="w-24 h-24 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 bg-slate-100" />
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${product.isStockOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-black uppercase tracking-tight line-clamp-1">{product.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-[9px] bg-slate-100 px-3 py-1 rounded-full font-black text-slate-700 uppercase border border-slate-200">{product.category}</span>
                        <span className="text-[9px] bg-purple-50 px-3 py-1 rounded-full font-black text-purple-600 uppercase border border-purple-100">KSh {formatNumber(product.retailPrice)}</span>
                        {product.isDiscounted && <span className="text-[9px] bg-amber-50 px-3 py-1 rounded-full font-black text-amber-600 uppercase border border-amber-100">Sale: {formatNumber(product.discountPrice)}</span>}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest">{formatNumber(product.stock)} Units In Node</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                    <button onClick={() => handleEdit(product)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-800 hover:text-amber-600 rounded-2xl transition-all border border-slate-100 hover:bg-amber-50" title="Edit Asset">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleToggleStock(product.id, product.isStockOpen)} disabled={updatingId === product.id} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${product.isStockOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'}`}>
                      {updatingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />} {product.isStockOpen ? 'Live' : 'Offline'}
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all border border-slate-100 hover:bg-red-50" title="Erase Asset">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="p-20 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Assets Found</p>
                </div>
              )}
            </div>
          </section>

          {/* --- ORDER LOGS --- */}
          <section className="space-y-6">
             <div className="flex items-center justify-between px-4">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-900 leading-none"><ShoppingBag size={14} /> Recent Orders</h3>
               <Link href="/admin/orders" className="text-[9px] font-black uppercase text-purple-600 hover:text-purple-700 tracking-widest">View All</Link>
             </div>
             <div className="bg-white border border-slate-200 rounded-[3rem] p-6 shadow-sm overflow-x-auto">
                {orders.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Order Ref</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-xs font-black text-black">#{order.id.slice(-6).toUpperCase()}</td>
                          <td className="p-4 text-xs font-bold text-slate-700">KSh {formatNumber(order.totalAmount)}</td>
                          <td className="p-4">
                            <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-[10px] text-slate-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                    <Clock size={32} className="mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Recent Orders</p>
                  </div>
                )}
             </div>
          </section>

          {/* --- CLIENT FEEDBACK --- */}
          <section className="space-y-6">
             <div className="flex items-center justify-between px-4">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-900 leading-none"><MessageSquare size={14} /> Contact Form Logs</h3>
               <Link href="/admin/feedback" className="text-[9px] font-black uppercase text-purple-600 hover:text-purple-700 tracking-widest">View All</Link>
             </div>
            <div className="grid gap-5">
              {feedbacks.slice(0, 3).map((fb) => (
                <div key={fb.id} className="p-8 sm:p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm flex flex-col sm:flex-row items-start justify-between gap-6 transition-all hover:border-purple-200">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <User size={16} className="text-purple-600" />
                      <span className="text-[10px] font-black text-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{fb.name}</span>
                      <span className="text-[10px] font-bold text-slate-500">{fb.email}</span>
                    </div>
                    <p className="text-sm sm:text-base text-slate-800 italic leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">"{fb.message}"</p>
                    <p className="text-[9px] text-slate-400 mt-4 uppercase font-black tracking-widest">{new Date(fb.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDeleteFeedback(fb.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-100 transition-all self-end sm:self-center shrink-0">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {feedbacks.length === 0 && (
                <div className="p-20 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Zero Logged Submissions</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}