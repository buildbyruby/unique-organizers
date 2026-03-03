"use client"

import { useState } from 'react'
import { upsertProduct } from '@/app/admin/actions'
import { Plus, Loader2, CheckCircle2, AlertCircle, ArrowLeft, ImagePlus, X, Tag, Ruler, Palette } from 'lucide-react'
import Link from 'next/link'

const PRESET_COLORS = [
  { name: 'Pitch Black', hex: '#000000' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Royal Purple', hex: '#9333ea' },
  { name: 'Cyber Blue', hex: '#3b82f6' },
  { name: 'Crimson', hex: '#ef4444' },
  { name: 'Gold', hex: '#eab308' },
]

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

// ELITE CATEGORY STRUCTURE
const CATEGORY_MAP: Record<string, { label: string, subs: string[] }> = {
  KITCHEN: {
    label: "Kitchen & Dining",
    subs: ["Small Appliances", "Storage & Organizers", "Cookware", "Plates & Dining", "Cutlery", "Lighting", "Barware", "Tea & Coffee Gear"]
  },
  HOME_LIVING: {
    label: "Home & Living",
    subs: ["Decor", "Furniture", "Rugs", "Bedding", "Cushions", "Candles & Scents", "Curtains", "Wall Art", "Mirrors"]
  },
  GIFTS: {
    label: "Gifts & Occasions",
    subs: ["Corporate", "Birthday", "Wedding", "Luxury Hampers", "Anniversary", "Baby Shower", "Seasonal", "Greeting Cards"]
  },
  ELECTRONICS: {
    label: "Electronics",
    subs: ["Audio", "Gadgets", "Smart Home", "Office Gear", "Photography", "Wearables", "Gaming", "Power & Cables"]
  },
  CLOTHING: {
    label: "Clothing & Apparel",
    subs: ["Men", "Women", "Kids", "Accessories", "Footwear", "Activewear", "Sleepwear", "Outerwear"]
  },
  BEAUTY: {
    label: "Beauty & Personal Care",
    subs: ["Skincare", "Makeup", "Fragrance", "Haircare", "Men's Grooming", "Beauty Tools", "Bath & Body", "Oral Care"]
  },
  GROCERY: {
    label: "Grocery & Food",
    subs: ["Dry Goods", "Beverages", "Spices", "Snacks", "Coffee & Tea", "Organic", "Condiments", "Baking Essentials"]
  },
  TOYS: {
    label: "Toys & Baby",
    subs: ["Educational", "Plush", "Baby Gear", "Games", "Outdoor Play", "Building Sets", "Puzzles"]
  },
  SPORTS: {
    label: "Sports & Outdoors",
    subs: ["Fitness", "Camping", "Cycling", "Swimming", "Team Sports", "Active Gear", "Yoga & Pilates"]
  },
  TOOLS: {
    label: "Tools & Hardware",
    subs: ["Hand Tools", "Power Tools", "Organizers", "Safety Gear", "Gardening Tools", "Home Improvement"]
  },
  OFFICE: {
    label: "Office Supplies",
    subs: ["Stationery", "Desk Organizers", "Tech Accessories", "Writing Tools", "Paper Products", "Filing & Storage"]
  },
  HEALTH: {
    label: "Health & Wellness",
    subs: ["Supplements", "Personal Care", "Yoga & Meditation", "Massagers", "Aromatherapy", "Fitness Trackers"]
  }
};

export default function AddProductPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  
  // Track selected category to dynamically filter subcategories
  const [activeCategory, setActiveCategory] = useState<string>('KITCHEN')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...urls]);
    }
  }

  const toggleColor = (hex: string) => {
    setSelectedColors(prev => 
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  async function clientAction(formData: FormData) {
    setLoading(true);
    setMessage(null);
    
    selectedColors.forEach(color => formData.append('colors', color));
    selectedSizes.forEach(size => formData.append('sizes', size));
    
    const result = await upsertProduct(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Asset Deployed to Production Successfully!' });
      setImagePreviews([]);
      setSelectedColors([]);
      setSelectedSizes([]);
      (document.getElementById('product-form') as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <form id="product-form" action={clientAction} className="space-y-8">
          
          <div className="flex items-center justify-between mb-12">
            <Link href="/admin/products" className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-[0.3em] italic">System_Add_Product</h1>
            <div className="w-12" />
          </div>

          {message && (
            <div className={`p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
              <p className="font-bold uppercase tracking-widest text-xs">{message.text}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="group relative aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] overflow-hidden hover:border-purple-500 transition-all flex flex-col items-center justify-center gap-4">
                <input 
                  type="file" 
                  name="images" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-purple-500 transition-colors">
                  <ImagePlus size={48} strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upload_Product_Images</span>
                </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative">
                      <img src={url} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  ))}
                </div>
              )}

              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Palette size={14} /> Available_Colors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => toggleColor(color.hex)}
                      className={`w-12 h-12 rounded-full border-2 transition-all transform hover:scale-110 ${
                        selectedColors.includes(color.hex) ? 'border-purple-500 scale-110 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Product_Identity</label>
                <input name="name" required placeholder="e.g. Premium Cooker Set" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-purple-500 outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Category</label>
                  <select 
                    name="category" 
                    required 
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-purple-500 outline-none appearance-none"
                  >
                    {Object.entries(CATEGORY_MAP).map(([slug, data]) => (
                      <option key={slug} value={slug}>{data.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Sub_Category</label>
                  <select 
                    name="subCategory" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-purple-500 outline-none appearance-none"
                  >
                    <option value="">Select Subcategory</option>
                    {CATEGORY_MAP[activeCategory]?.subs.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Retail_Price (KSh)</label>
                  <input name="retailPrice" type="number" required placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Wholesale_Price</label>
                  <input name="wholesalePrice" type="number" required placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Size_Variants</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
                        selectedSizes.includes(size) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Asset_Description</label>
                <textarea name="description" rows={5} required placeholder="Describe technical specifications and features..." className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm focus:border-purple-500 outline-none resize-none" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-black uppercase tracking-[0.3em] py-8 rounded-[2rem] hover:bg-purple-600 hover:text-white transition transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 italic"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <Plus size={24} strokeWidth={3} />
                    Deploy_Asset
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}