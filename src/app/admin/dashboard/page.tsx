"use client"
import { useState, useEffect, useRef } from 'react';
import { 
  Plus, ExternalLink, Trash2, Loader2, LayoutGrid, 
  ImagePlus, X, Tag, Edit3, RefreshCcw, MessageSquare, Star, Layers, AlignLeft
} from 'lucide-react';
import Link from 'next/link';
import { updateProductCategory, upsertProduct, deleteProduct } from '@/app/actions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLOR_PRESETS = [
  { label: 'Midnight', hex: '#000000' },
  { label: 'Crystal', hex: '#FFFFFF' },
  { label: 'Frosted', hex: '#F3F4F6' },
  { label: 'Gold', hex: '#D4AF37' },
  { label: 'Acrylic', hex: '#E0F2FE' }
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const GENDER_OPTIONS = ["Unisex", "Men", "Women", "Kids"];

const CATEGORY_STRUCTURE: Record<string, { label: string, subcategories: string[] }> = {
  KITCHEN: { label: "Kitchen & Dining", subcategories: ["Small Appliances", "Storage & Organizers", "Cookware", "Plates & Dining", "Cutlery", "Lighting", "Barware", "Tea & Coffee Gear"] },
  HOME_LIVING: { label: "Home & Living", subcategories: ["Decor", "Furniture", "Rugs", "Bedding", "Cushions", "Candles & Scents", "Curtains", "Wall Art", "Mirrors"] },
  GIFTS: { label: "Gifts & Occasions", subcategories: ["Corporate", "Birthday", "Wedding", "Luxury Hampers", "Anniversary", "Baby Shower", "Seasonal", "Greeting Cards"] },
  ELECTRONICS: { label: "Electronics", subcategories: ["Audio", "Gadgets", "Smart Home", "Office Gear", "Photography", "Wearables", "Gaming", "Power & Cables"] },
  CLOTHING: { label: "Clothing & Apparel", subcategories: ["Men", "Women", "Kids", "Accessories", "Footwear", "Activewear", "Sleepwear", "Outerwear"] },
  BEAUTY: { label: "Beauty & Personal Care", subcategories: ["Skincare", "Makeup", "Fragrance", "Haircare", "Men's Grooming", "Beauty Tools", "Bath & Body", "Oral Care"] },
  GROCERY: { label: "Grocery & Food", subcategories: ["Dry Goods", "Beverages", "Spices", "Snacks", "Coffee & Tea", "Organic", "Condiments", "Baking Essentials"] },
  TOYS: { label: "Toys & Baby", subcategories: ["Educational", "Plush", "Baby Gear", "Games", "Outdoor Play", "Building Sets", "Puzzles"] },
  SPORTS: { label: "Sports & Outdoors", subcategories: ["Fitness", "Camping", "Cycling", "Swimming", "Team Sports", "Active Gear", "Yoga & Pilates"] },
  TOOLS: { label: "Tools & Hardware", subcategories: ["Hand Tools", "Power Tools", "Organizers", "Safety Gear", "Gardening Tools", "Home Improvement"] },
  OFFICE: { label: "Office Supplies", subcategories: ["Stationery", "Desk Organizers", "Tech Accessories", "Writing Tools", "Paper Products", "Filing & Storage"] },
  HEALTH: { label: "Health & Wellness", subcategories: ["Supplements", "Personal Care", "Yoga & Meditation", "Massagers", "Aromatherapy", "Fitness Trackers"] }
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: '', name: '', description: '', retailPrice: '', wholesalePrice: '',
    discountPrice: '', category: 'KITCHEN', subCategory: '',
    stock: '20', minWholesale: '5',
    images: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    gender: 'Unisex'
  });

  const resolveImageUrl = (images: any): string => {
    const fallback = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image';
    if (!images) return fallback;
    let parsed = images;
    if (typeof images === 'string') {
      if (images.startsWith('[')) {
        try { parsed = JSON.parse(images); } catch { parsed = images.split(','); }
      } else {
        parsed = images.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    return typeof parsed === 'string' && parsed ? parsed : fallback;
  };

  const formatNumber = (val: string) => {
    if (!val) return "";
    const cleanValue = val.replace(/,/g, "");
    if (isNaN(Number(cleanValue))) return val.replace(/[^\d]/g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const stripNumber = (val: string) => val.replace(/,/g, "");

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

  const handleEditInit = (product: any) => {
    setEditMode(true);
    let imagesArray: string[] = [];
    if (Array.isArray(product.images)) {
      imagesArray = product.images;
    } else if (typeof product.images === 'string') {
      imagesArray = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    setForm({
      id: product.id, name: product.name, description: product.description || '',
      retailPrice: formatNumber(product.retailPrice.toString()),
      wholesalePrice: formatNumber((product.wholesalePrice || 0).toString()),
      discountPrice: product.discountPrice ? formatNumber(product.discountPrice.toString()) : '',
      category: product.category, subCategory: product.subCategory || '',
      stock: product.stock.toString(), minWholesale: (product.minWholesale || 5).toString(),
      images: imagesArray, colors: product.colors || [], sizes: product.sizes || [],
      gender: product.gender || 'Unisex'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditMode(false);
    setForm({
      id: '', name: '', description: '', retailPrice: '', wholesalePrice: '',
      discountPrice: '', category: 'KITCHEN', subCategory: '',
      stock: '20', minWholesale: '5',
      images: [], colors: [], sizes: [], gender: 'Unisex'
    });
  };

  const handleCategoryChange = async (productId: string, newCategory: string) => {
    setUpdatingId(productId);
    const result = await updateProductCategory(productId, newCategory);
    if (result.success) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, category: newCategory } : p));
    }
    setTimeout(() => setUpdatingId(null), 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (err: any) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleColor = (hex: string) => {
    setForm(prev => {
      const exists = prev.colors.includes(hex);
      return { ...prev, colors: exists ? prev.colors.filter(c => c !== hex) : [...prev.colors, hex] };
    });
  };

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData();
    if (form.id) formData.append("id", form.id);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("categoryId", form.category);
    formData.append("subCategory", form.subCategory);
    const rPrice = stripNumber(form.retailPrice);
    const wPrice = stripNumber(form.wholesalePrice);
    const dPrice = stripNumber(form.discountPrice);
    formData.append("retailPrice", rPrice);
    formData.append("wholesalePrice", wPrice);
    formData.append("discountPrice", dPrice || "0");
    const hasDiscount = dPrice !== "" && Number(dPrice) > 0;
    formData.append("isDiscounted", hasDiscount ? "true" : "false");
    formData.append("stock", form.stock);
    formData.append("minWholesale", form.minWholesale);
    formData.append("gender", form.gender);
    form.images.forEach(url => formData.append("images", url));
    form.colors.forEach(c => formData.append("colors", c));
    form.sizes.forEach(s => formData.append("sizes", s));
    const res = await upsertProduct(formData);
    if (res.success) {
      resetForm();
      refreshData();
    } else {
      alert("Error: " + res.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Erase product? This cannot be undone.')) return;
    await deleteProduct(id);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Live</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-black uppercase italic">Command <span className="text-purple-600">Center</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshData} className="p-2 md:p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-all">
            <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <div className={`col-span-1 lg:col-span-5 border p-5 md:p-10 rounded-[2rem] lg:rounded-[3rem] h-fit lg:sticky lg:top-8 shadow-xl transition-all ${editMode ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black">
              {editMode ? <Edit3 size={20} className="text-purple-600" /> : <Plus size={20} className="text-purple-600" />}
              {editMode ? 'Modify Asset' : 'New Deployment'}
            </h3>
            {editMode && (
              <button onClick={resetForm} className="px-4 py-2 rounded-full bg-red-50 text-[10px] font-black uppercase text-red-500 flex items-center gap-1 hover:bg-red-100 transition-colors">
                <X size={12} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Name</label>
              <input className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-600 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Signature Velvet Hoodie" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">System Brief (Description)</label>
              <textarea rows={3} className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-purple-600 outline-none transition-all resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detail the specifications and elite features of this asset..." />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-xs font-bold outline-none cursor-pointer" value={form.category} onChange={e => setForm({...form, category: e.target.value, subCategory: ''})}>
                  {Object.entries(CATEGORY_STRUCTURE).map(([slug, data]) => (
                    <option key={slug} value={slug}>{data.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Sub Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-xs font-bold outline-none cursor-pointer disabled:opacity-50" value={form.subCategory} onChange={e => setForm({...form, subCategory: e.target.value})} required>
                  <option value="">Select Option</option>
                  {CATEGORY_STRUCTURE[form.category]?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Gender</label>
              <select className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-xs font-bold outline-none cursor-pointer" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Layers size={14} className="text-purple-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Value Matrix</span>
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <label className="w-16 text-[8px] font-black text-purple-300 uppercase tracking-widest">Retail</label>
                  <input type="text" value={form.retailPrice} onChange={e => setForm({...form, retailPrice: formatNumber(e.target.value)})} required className="flex-1 bg-transparent text-white font-black text-sm outline-none" placeholder="0" />
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <label className="w-16 text-[8px] font-black text-pink-300 uppercase tracking-widest">Bulk</label>
                  <input type="text" value={form.wholesalePrice} onChange={e => setForm({...form, wholesalePrice: formatNumber(e.target.value)})} required className="flex-1 bg-transparent text-white font-black text-sm outline-none" placeholder="0" />
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <label className="w-16 text-[8px] font-black text-emerald-300 uppercase tracking-widest">Sale</label>
                  <input type="text" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: formatNumber(e.target.value)})} className="flex-1 bg-transparent text-white font-black text-sm outline-none" placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Stock Units</label>
                <input type="number" className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-xs font-bold outline-none" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Wholesale MOQ</label>
                <input type="number" className="w-full bg-white border border-slate-200 rounded-2xl p-5 text-xs font-bold outline-none" value={form.minWholesale} onChange={e => setForm({...form, minWholesale: e.target.value})} required />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map(size => (
                  <button key={size} type="button" onClick={() => toggleSize(size)} className={`px-5 py-3 rounded-2xl text-[10px] font-black transition-all border ${form.sizes.includes(size) ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-5 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Palettes:</span>
              {COLOR_PRESETS.map((preset) => (
                <button type="button" key={preset.hex} onClick={() => toggleColor(preset.hex)} className={`w-10 h-10 rounded-full border-4 transition-all ${form.colors.includes(preset.hex) ? 'border-purple-600 scale-110 shadow-xl' : 'border-white shadow-md hover:scale-105'}`} style={{ backgroundColor: preset.hex }} />
              ))}
            </div>

            {/* MEDIA UPLOAD — Supabase Storage, direct from device */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Media Channels</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50 transition-all disabled:opacity-50"
              >
                {uploadingImage ? (
                  <><Loader2 size={22} className="animate-spin text-purple-600" /><span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Uploading...</span></>
                ) : (
                  <><ImagePlus size={22} className="text-purple-600" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tap to choose photos from your device</span></>
                )}
              </button>

              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-white rounded-2xl border border-slate-200">
                  {form.images.map((url, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 group">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button disabled={formLoading} className={`w-full py-7 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl ${editMode ? 'bg-black text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-black shadow-purple-500/30'}`}>
              {formLoading ? 'SYNCHRONIZING...' : editMode ? 'COMMIT CHANGES' : 'DEPLOY ASSET'}
            </button>
          </form>
        </div>

        <div className="col-span-1 lg:col-span-7 space-y-12">
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black px-4 leading-none">
              <LayoutGrid size={18} className="text-purple-600" /> Active Archives ({products.length})
            </h3>
            <div className="grid gap-5">
              {products.map((product) => (
                <div key={product.id} className="p-5 bg-white border border-slate-100 rounded-[3rem] flex items-center gap-8 shadow-sm group hover:border-purple-200 transition-all hover:shadow-2xl hover:shadow-slate-200/50">
                  <div className="relative overflow-hidden rounded-[2rem] w-24 h-24 flex-shrink-0 bg-slate-100">
                    <img src={resolveImageUrl(product.images)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={product.name} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Error'; }} />
                    {product.isDiscounted && (
                      <div className="absolute top-0 right-0 bg-emerald-500 p-2 rounded-bl-2xl shadow-lg">
                        <Tag size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <select className="text-[9px] font-black text-purple-500 uppercase tracking-widest bg-transparent cursor-pointer outline-none hover:text-purple-700 transition-colors" value={product.category} onChange={(e) => handleCategoryChange(product.id, e.target.value)}>
                        {Object.entries(CATEGORY_STRUCTURE).map(([slug, data]) => (
                          <option key={slug} value={slug}>{data.label.toUpperCase()}</option>
                        ))}
                      </select>
                      <span className="text-[8px] font-black text-slate-300 uppercase">/</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.subCategory || 'General'}</span>
                      {updatingId === product.id && <Loader2 size={10} className="animate-spin text-purple-500" />}
                    </div>
                    <h4 className="text-lg font-black text-black uppercase italic tracking-tighter leading-none mb-2">{product.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mb-4 line-clamp-2 italic leading-relaxed">{product.description || "No description provided."}</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stock Units</span>
                        <span className="text-[11px] font-black text-black">{product.stock} Units</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                          <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Retail Rate</span>
                          <span className="text-[12px] font-black text-purple-700 italic">KSh {Number(product.retailPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-100">
                          <span className="text-[8px] font-black text-pink-400 uppercase tracking-widest">Bulk Rate</span>
                          <span className="text-[12px] font-black text-pink-700 italic">KSh {Number(product.wholesalePrice || 0).toLocaleString()}</span>
                        </div>
                        {product.isDiscounted && (
                          <div className="flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Sale Rate</span>
                            <span className="text-[12px] font-black text-emerald-600 italic">KSh {Number(product.discountPrice || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pr-6">
                    <button onClick={() => handleEditInit(product)} className="p-5 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-[2rem] transition-all">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[2rem] transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-black px-4 leading-none">
              <MessageSquare size={18} className="text-purple-600" /> Client Logs ({reviews.length})
            </h3>
            <div className="grid gap-5">
              {reviews.map((review) => (
                <div key={review.id} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex items-start justify-between group hover:border-slate-200 transition-all">
                  <div className="flex-1">
                    <div className="flex text-amber-400 mb-4 gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />)}
                    </div>
                    <span className="text-[11px] font-black text-black uppercase tracking-widest">{review.name || "Anonymous Client"}</span>
                    <p className="text-sm text-slate-500 mt-4 italic leading-relaxed font-medium">"{review.comment}"</p>
                  </div>
                  <button onClick={() => handleDeleteReview(review.id)} className="p-5 bg-slate-50 text-slate-300 rounded-[2rem] group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                    <Trash2 size={22} />
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
