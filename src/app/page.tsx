import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  ShoppingCart, 
  Search, 
  ShoppingBag,
  Star,
  Package,
  Phone,
  ChevronRight,
  LayoutGrid,
  MessageCircle,
  History,
  Lock,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { Metadata } from 'next';
import FeedbackForm from '@/components/FeedbackForm';
import PublicReviews from '@/components/PublicReviews';

// --- 0. DYNAMIC CONFIGURATION ---
export const dynamic = 'force-dynamic';

// --- 1. SEO & BRANDING CONFIGURATION ---
export const metadata: Metadata = {
  title: 'Unique Organizers | Premium System Stock Nairobi',
  description: 'The elite destination for high-tier organizational assets. Located at Sirikiwa Business Centre, Accra Road. Delivery across Nairobi within 24 hours.',
  keywords: ['Organizers', 'Nairobi Electronics', 'Unique Organizers Kenya', 'Sirikiwa Business Centre'],
  openGraph: {
    title: 'Unique Organizers | Elite System Stock',
    description: 'Direct access to high-tier organizational assets. Curated for performance.',
    url: 'https://unique-organizers.com',
    siteName: 'Unique Organizers',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_KE',
    type: 'website',
  },
};

export default async function HomePage(props: {
  searchParams: Promise<{ category?: string; sub?: string; q?: string }>
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.category;
  const subCategory = searchParams.sub;
  const query = searchParams.q;

  // --- 2. FETCHING LOGIC (REPAIRED) ---
  const products = await prisma.product.findMany({
    where: {
      AND: [
        { isStockOpen: true }, // Always ensure we only show open stock
        
        // Filter by Main Category (matches either ID or Name)
        category ? { 
          OR: [
            { categoryId: category },
            { category: { name: category } }
          ] 
        } : {},

        // Filter by Subcategory (Matches the 'subCategory' column in your Product table)
        subCategory ? { 
          subCategory: { 
            equals: subCategory, 
            mode: 'insensitive' // Prevents "Plush" vs "plush" mismatch issues
          } 
        } : {},

        // Handle Search
        query ? { 
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        } : {}
      ]
    },
    include: {
      category: true 
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch Public Reviews
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  // Fetch Active Adverts
  const activeAdverts = await prisma.advert.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
    take: 1
  });

  // --- 3. CATEGORIES DATA ---
  const categoriesData = [
    { 
      id: "KITCHEN", 
      name: "Kitchen & Dining", 
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600", 
      subs: ["Small Appliances","Storage & Organizers","Cookware","Plates & Dining","Cutlery","Lighting","Barware","Tea & Coffee Gear"] 
    },
    { 
      id: "HOME_LIVING", 
      name: "Home & Living", 
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600", 
      subs: ["Decor","Furniture","Rugs","Bedding","Cushions","Candles & Scents","Curtains","Wall Art","Mirrors"] 
    },
    { 
      id: "GIFTS", 
      name: "Gifts & Occasions", 
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600", 
      subs: ["Corporate","Birthday","Wedding","Luxury Hampers","Anniversary","Baby Shower","Seasonal","Greeting Cards"] 
    },
    { 
      id: "ELECTRONICS", 
      name: "Electronics", 
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600", 
      subs: ["Audio","Gadgets","Smart Home","Office Gear","Photography","Wearables","Gaming","Power & Cables"] 
    },
    { 
      id: "CLOTHING", 
      name: "Clothing & Apparel", 
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600", 
      subs: ["Men","Women","Kids","Accessories","Footwear","Activewear","Sleepwear","Outerwear"] 
    },
    { 
      id: "BEAUTY", 
      name: "Beauty & Personal Care", 
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600", 
      subs: ["Skincare","Makeup","Fragrance","Haircare","Men's Grooming","Beauty Tools","Bath & Body","Oral Care"] 
    },
    { 
      id: "GROCERY", 
      name: "Grocery & Food", 
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600", 
      subs: ["Dry Goods","Beverages","Spices","Snacks","Coffee & Tea","Organic","Condiments","Baking Essentials"] 
    },
    { 
      id: "SPORTS", 
      name: "Sports & Fitness", 
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600", 
      subs: ["Fitness","Camping","Cycling","Swimming","Team Sports","Active Gear","Yoga & Meditation"] 
    },
    {
  id: "TOYS", 
  name: "Toys & Baby", 
  image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600", 
  subs: ["Educational", "Plush", "Baby Gear", "Games", "Outdoor Play", "Building Sets", "Puzzles"] 
},
    { 
      id: "OFFICE", 
      name: "Office Supplies", 
      image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=600", 
      subs: ["Stationery","Desk Organizers","Tech Accessories","Writing Tools","Paper Products","Filing & Storage"] 
    },
    { 
      id: "HEALTH", 
      name: "Health & Wellness", 
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600", 
      subs: ["Supplements","Personal Care","Yoga & Meditation","Massagers","Aromatherapy","Fitness Trackers"] 
    }
  ];

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-purple-300/50 font-sans antialiased overflow-x-hidden relative">
      <a href="https://wa.me/254797517565" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-[150] group flex items-center gap-3">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 px-6 py-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 pointer-events-none">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Direct WhatsApp</span>
        </div>
        <div className="w-16 h-16 bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(37,211,102,0.3)] hover:shadow-[0_20px_50px_rgba(37,211,102,0.5)] transition-all duration-500 hover:-translate-y-2 active:scale-90 relative overflow-hidden">
           <MessageCircle size={28} fill="currentColor" />
        </div>
      </a>

      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-400/20 blur-[150px] rounded-full mix-blend-multiply animate-pulse" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[80px]" />
      </div>

      <div className="relative z-[90] w-full bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/90">Premium Stock Arrived • 24H Rapid Dispatch Available</span>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 w-full z-[100] backdrop-blur-2xl border-b border-white/40 bg-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 md:gap-4">
            
            <Link href="/" className="order-1 text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                 <div className="w-5 h-5 bg-purple-500 rounded-sm rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-slate-900">UNIQUE</span>
                <span className="text-[8px] font-black tracking-[0.4em] text-purple-600 uppercase hidden sm:block">Organizers</span>
              </div>
            </Link>

            <div className="order-2 md:order-3 flex items-center space-x-2 md:space-x-4 shrink-0">
              <Link href="/admin/login" className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all"><Lock size={18} /></Link>
              <Link href="/dashboard" className="bg-slate-900 text-white px-5 md:px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Client Panel</Link>
            </div>

            <div className="order-3 md:order-2 flex w-full md:flex-1 md:max-w-md mx-0 md:mx-8">
              <form action="/" className="relative w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="q" defaultValue={query} placeholder="SEARCH ARCHIVES..." className="w-full bg-white border border-slate-200 rounded-full py-3 pl-14 pr-6 text-sm font-bold tracking-widest outline-none focus:border-purple-500 transition-all shadow-sm" />
              </form>
            </div>

          </div>
        </div>
      </nav>

      {/* --- SEARCH HEADER --- */}
      {query && (
        <section className="relative pt-12 md:pt-20 pb-4 px-6 z-10">
          <div className="max-w-7xl mx-auto relative w-full">
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-6 group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Reset System Search
              </Link>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight uppercase text-slate-900">Matches for <span className="text-purple-600 italic">"{query}"</span></h1>
              <p className="mt-4 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">{products.length} Assets Identified in Node</p>
            </div>
          </div>
        </section>
      )}

      {/* --- ADVERT SECTION --- */}
      {!query && activeAdverts.length > 0 && (
        <section className="pt-8 md:pt-12 px-4 md:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {activeAdverts.map((ad) => (
              <a key={ad.id} href={ad.link || "#catalog"} className="block relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] aspect-[21/9] md:aspect-[32/9] bg-slate-900 border border-slate-800 shadow-2xl">
                <img src={ad.imageUrl} alt={ad.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
                <div className="absolute inset-0 p-6 md:p-16 flex flex-col justify-center max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/30 border border-purple-500/50 text-[9px] font-black uppercase tracking-[0.3em] text-purple-100 w-fit mb-4 backdrop-blur-md">
                    Featured Partner
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-tight mb-4 drop-shadow-md">{ad.title}</h2>
                  {ad.description && <p className="text-slate-200 text-sm md:text-lg font-medium max-w-md line-clamp-2 md:line-clamp-none drop-shadow-sm">{ad.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* --- GLOBAL DEPARTMENTS --- */}
      {!query && (
        <section className={`py-8 px-4 md:px-8 relative z-10 ${activeAdverts.length === 0 ? 'pt-12 md:pt-20' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                 <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 italic">Global Departments</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Curated By Department</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
              <Link href="/#catalog" className="relative group overflow-hidden rounded-[2.5rem] md:rounded-[3rem] aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-950 text-white border border-white/10 shadow-lg hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1">
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <LayoutGrid size={36} className="text-purple-400 group-hover:scale-110 transition-transform duration-500" />
                  <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-center">All Collections</span>
                </div>
              </Link>
              {categoriesData.map((cat) => (
                <Link key={cat.id} href={`/?category=${cat.id}#catalog`} className="relative group overflow-hidden rounded-[2.5rem] md:rounded-[3rem] aspect-[3/4] border-[3px] border-white/80 transition-all duration-700 hover:-translate-y-2 shadow-sm hover:shadow-xl">
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-end justify-center p-6 text-center">
                    <span className="text-white font-black text-sm md:text-lg uppercase tracking-widest leading-tight">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- CATALOG --- */}
      <section id="catalog" className="py-8 md:py-12 px-2 md:px-8 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 md:mb-16 flex flex-col items-start px-2 gap-6">
            {!query && (
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900">
                {subCategory || (category ? categoriesData.find(c => c.id === category)?.name : 'Featured Assets')}
              </h2>
            )}
            {category && !query && (
              <div className="flex flex-wrap gap-2">
                <Link href={`/?category=${category}#catalog`} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${!subCategory ? 'bg-black text-white border-black shadow-lg' : 'bg-white/50 border-slate-300 text-slate-600 hover:border-black'}`}>
                  All {categoriesData.find(c => c.id === category)?.name.split(' ')[0]}
                </Link>
                {categoriesData.find(c => c.id === category)?.subs?.map(sub => (
                  <Link key={sub} href={`/?category=${category}&sub=${encodeURIComponent(sub)}#catalog`} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${subCategory === sub ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white/50 border-slate-300 text-slate-600 hover:border-black'}`}>
                    {sub}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {products.map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group bg-white/40 backdrop-blur-2xl rounded-[2rem] p-2 transition-all duration-700 hover:-translate-y-2 flex flex-col overflow-hidden shadow-sm hover:shadow-xl border border-white/50">
                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-100 relative shadow-inner">
                  <img src={product.images[0] || "/placeholder-product.jpg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-900 w-fit">
                      {product.category?.name || "Asset"}
                    </div>
                    {product.isDiscounted && (
                      <div className="bg-red-600 text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg w-fit">
                        Sale Event
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-xs md:text-lg font-black tracking-tight mb-2 uppercase text-slate-900 truncate">{product.name}</h3>
                  <div className="mt-auto pt-4 flex justify-between items-end border-t border-slate-200/50">
                    <div className="flex flex-col">
                      {product.isDiscounted && product.discountPrice ? (
                        <>
                          <p className="text-sm md:text-2xl font-black text-red-600 italic leading-none">
                            <span className="mr-1 text-[9px] not-italic">KSh</span>{product.discountPrice.toLocaleString()}
                          </p>
                          <p className="text-[10px] md:text-xs font-bold text-slate-400 line-through mt-1">KSh {product.retailPrice.toLocaleString()}</p>
                        </>
                      ) : (
                        <p className="text-sm md:text-2xl font-black text-slate-900 italic">
                          <span className="text-purple-600 mr-1 text-[9px] not-italic">KSh</span>{product.retailPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <ShoppingCart size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50 backdrop-blur-md">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Archive Empty - No matching assets identified.</p>
              {category && <Link href={`/?category=${category}#catalog`} className="inline-block mt-4 text-[10px] font-black text-purple-600 uppercase border-b-2 border-purple-600 pb-1">Return to Category</Link>}
            </div>
          )}
        </div>
      </section>

      {/* --- HERO / WELCOME --- */}
      {!query && (
        <section className="relative py-16 md:py-24 px-6 z-10 border-t border-slate-200 mt-8 bg-white/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 lg:gap-8">
            <div className="max-w-3xl space-y-10 w-full">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-purple-200/60 bg-white/80 backdrop-blur-xl text-[9px] font-black uppercase tracking-[0.3em] text-purple-800 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" /> Curated High-End Stock
              </div>
              <h1 className="text-5xl md:text-[5rem] lg:text-[6.5rem] font-black tracking-tighter leading-[0.85] uppercase text-slate-900">
                Redefine<br /><span className="bg-gradient-to-br from-purple-700 via-indigo-600 to-slate-900 bg-clip-text text-transparent italic pr-4">Your Space.</span>
              </h1>
              <p className="text-slate-600 max-w-xl text-lg md:text-xl font-medium leading-relaxed">Direct access to high-tier organizational assets. Cyber-luxury curation delivered to your door in 24 hours.</p>
              <div className="flex flex-wrap items-center gap-5 pt-4">
                <Link href="#catalog" className="relative group overflow-hidden bg-slate-900 text-white px-8 py-4.5 rounded-full text-xs font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(147,51,234,0.3)] transition-all flex items-center gap-3 active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">Explore Archives <ChevronRight size={16} /></span>
                </Link>
              </div>
            </div>
            <div className="relative w-full max-w-md lg:w-auto h-[250px] flex items-center justify-center">
              <div className="absolute top-0 right-10 p-6 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_40px_rgba(147,51,234,0.1)] transform rotate-6 hover:rotate-0 transition-all duration-700">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-50 to-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl text-slate-900">4.9/5</h4>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- REVIEWS --- */}
      <PublicReviews reviews={reviews} />

      {/* --- SUPPORT / FEEDBACK --- */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] border-t border-white/60" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative">
          <div className="space-y-12 text-center lg:text-left">
            <h2 className="text-5xl md:text-[5.5rem] font-black uppercase tracking-tighter italic leading-[0.85] text-slate-900">
              Crafted for Space.<br/><span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Built on Trust.</span>
            </h2>
            <Link href="/dashboard" className="block p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl hover:shadow-purple-500/20 transition-all group">
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.2rem] bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform"><History size={32} className="text-purple-400" /></div>
                  <div className="text-left">
                    <h4 className="font-black text-xl uppercase tracking-widest mb-1">Live Order Panel</h4>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Track your current acquisitions</p>
                  </div>
               </div>
            </Link>
            <a href="tel:0797517565" className="inline-flex items-center gap-5 group p-2 pr-10 rounded-full bg-slate-200 text-slate-900 hover:bg-slate-300 transition-all">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white"><Phone size={20} /></div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">Direct Support</span>
                <span className="text-base font-black">+254 797 517 565</span>
              </div>
            </a>
          </div>
          <div className="relative"><FeedbackForm /></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 py-16 px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <span className="text-2xl font-black tracking-tighter italic text-slate-900">UNIQUE <span className="text-purple-700">ORGANIZERS</span></span>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">© 2026 - Sirikiwa Business Centre, Nairobi</p>
          </div>
          <div className="flex flex-col items-center gap-4">
             <Link href="/admin/login" className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-purple-600 transition-all"><UserCheck size={14} /> Staff Authorization</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}