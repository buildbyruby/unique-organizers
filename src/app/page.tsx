import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  ShoppingCart, 
  Search, 
  LayoutDashboard, 
  ShoppingBag,
  Globe,
  Star,
  Package,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  Quote,
  MessageCircle,
  History,
  Lock,
  UserCheck
} from 'lucide-react';
import { Metadata } from 'next';

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
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.category;
  const query = searchParams.q;

  // Optimized Fetching
  const products = await prisma.product.findMany({
    where: {
      AND: [
        category ? { category: category } : {},
        query ? { 
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        } : {}
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  const categoriesData = [
    { id: "KITCHEN", name: "Kitchen & Dining", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600" },
    { id: "HOME_LIVING", name: "Home & Living", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600" },
    { id: "ELECTRONICS", name: "Electronics", image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600" },
    { id: "CLOTHING", name: "Clothing & Apparel", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600" },
    { id: "BEAUTY", name: "Beauty & Personal Care", image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=600" },
    { id: "GROCERY", name: "Grocery & Food", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600" },
    { id: "TOYS", name: "Toys & Baby", image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80&w=600" },
    { id: "SPORTS", name: "Sports & Outdoors", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600" },
    { id: "AUTOMOTIVE", name: "Automotive Elite", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600" },
    { id: "PETS", name: "Pet Supplies", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600" },
    { id: "TOOLS", name: "Tools & Hardware", image: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=600" },
    { id: "OFFICE", name: "Office Supplies", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600" },
    { id: "HEALTH", name: "Health & Wellness", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" },
    { id: "ENTERTAINMENT", name: "Entertainment", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600" },
    { id: "GARDEN", name: "Garden & Outdoor", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600" },
  ];

  return (
    <div 
      suppressHydrationWarning 
      className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-purple-300/50 font-sans antialiased overflow-x-hidden relative"
    >
      {/* --- WHATSAPP FLOATING CONTACT --- */}
      <a 
        href="https://wa.me/254797517565?text=Hello%20Unique%20Organizers,%20I'm%20interested%20in%20your%20premium%20assets." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[150] group flex items-center gap-3"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 px-6 py-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 pointer-events-none">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Direct WhatsApp</span>
        </div>
        <div className="w-16 h-16 bg-[#25D366] text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(37,211,102,0.3)] hover:shadow-[0_20px_50px_rgba(37,211,102,0.5)] transition-all duration-500 hover:-translate-y-2 active:scale-90 relative overflow-hidden">
           <MessageCircle size={28} fill="currentColor" />
           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </div>
      </a>

      {/* --- CYBER-LUXURY AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-400/20 blur-[150px] rounded-full mix-blend-multiply animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-400/20 blur-[150px] rounded-full mix-blend-multiply animate-pulse duration-[8000ms]" />
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-pink-300/15 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[80px]" />
      </div>

      {/* --- ANNOUNCEMENT BAR --- */}
      <div className="relative z-[90] w-full bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 py-2.5 text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20">
        <Sparkles size={12} className="text-purple-300 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/90">Premium Stock Arrived • 24H Rapid Dispatch Available</span>
      </div>

      {/* --- ULTRA-MODERN NAVIGATION --- */}
      <nav className="sticky top-0 w-full z-[100] backdrop-blur-2xl border-b border-white/40 bg-white/40 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-slate-900 to-purple-800 rounded-xl group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-xl"/>
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-slate-900 transition-colors group-hover:text-purple-700">UNIQUE</span>
              <span className="text-[8px] font-black tracking-[0.4em] text-purple-600 uppercase hidden sm:block mt-0.5">Organizers</span>
            </div>
          </Link>
          
          <div className="flex items-center flex-1 max-w-lg mx-4 lg:mx-12">
            <form action="/" className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
              <input 
                name="q"
                defaultValue={query}
                placeholder="SEARCH ARCHIVES..." 
                className="w-full bg-white/50 backdrop-blur-xl border border-white/60 rounded-full py-3.5 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-purple-300 focus:shadow-[0_0_30px_rgba(147,51,234,0.15)] outline-none transition-all duration-300 placeholder:text-slate-400 text-slate-900 shadow-inner shadow-slate-200/50"
              />
            </form>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* --- THE ADMIN BUTTON (HIGH VISIBILITY) --- */}
            <Link 
              href="/admin/login" 
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
            >
              <Lock size={14} /> 
              <span className="hidden xs:block">Admin</span>
            </Link>

            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-purple-700 transition-colors">
              <ShoppingBag size={18} className="text-purple-600" /> Orders
            </Link>
            
            <Link
              href="/dashboard"
              className="relative group overflow-hidden bg-slate-900 text-white px-6 md:px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.3)] transition-all active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Client Panel</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 md:pt-36 pb-16 md:pb-24 px-6 overflow-hidden flex items-center min-h-[65vh] z-10">
        <div className="max-w-7xl mx-auto relative w-full">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-16 lg:gap-8">
            <div className="max-w-3xl space-y-10 w-full">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-purple-200/60 bg-white/40 backdrop-blur-xl text-[9px] font-black uppercase tracking-[0.3em] text-purple-800">
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                Curated High-End Stock
              </div>
              
              <h1 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] uppercase text-slate-900">
                Redefine<br />
                <span className="bg-gradient-to-br from-purple-700 via-indigo-600 to-slate-900 bg-clip-text text-transparent italic pr-4">Your Space.</span>
              </h1>
              
              <p className="text-slate-600 max-w-xl text-lg md:text-xl font-medium leading-relaxed">
                Direct access to high-tier organizational assets. Cyber-luxury curation delivered to your door in 24 hours.
              </p>

              <div className="flex flex-wrap items-center gap-5 pt-4">
                <Link href="#catalog" className="relative group overflow-hidden bg-slate-900 text-white px-8 py-4.5 rounded-full text-xs font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(147,51,234,0.3)] transition-all flex items-center gap-3 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 flex items-center gap-2">Explore Archives <ChevronRight size={16} /></span>
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-md lg:w-auto h-[300px] flex items-center justify-center">
              <div className="absolute top-0 right-10 p-6 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(147,51,234,0.1)] transform rotate-6 hover:rotate-0 transition-all duration-700">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-inner">
                    <Star size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl text-slate-900">4.9/5</h4>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Rating</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-0 p-6 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transform -rotate-3 hover:rotate-0 transition-all duration-700 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-inner">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-900 uppercase tracking-tight">Rapid Dispatch</h4>
                    <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mt-0.5">Under 24H Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VISUAL CATEGORIES --- */}
      <section className="py-10 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
               <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 italic">Global Departments</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Curated By Department</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            <Link href="/" className="relative group overflow-hidden rounded-[2.5rem] md:rounded-[3rem] aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-950 text-white border border-white/10">
              <div className="relative z-10 flex flex-col items-center gap-4">
                <LayoutGrid size={36} className="text-purple-400 group-hover:scale-110 transition-transform duration-500" />
                <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-center">All Collections</span>
              </div>
            </Link>

            {categoriesData.map((cat) => (
              <Link key={cat.id} href={`/?category=${cat.id}`} className="relative group overflow-hidden rounded-[2.5rem] md:rounded-[3rem] aspect-[3/4] border-[3px] border-white/80 transition-all duration-700 hover:-translate-y-2">
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end justify-center p-6 text-center">
                  <span className="text-white font-black text-sm md:text-lg uppercase tracking-widest leading-tight">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRODUCT GRID --- */}
      <section id="catalog" className="py-16 md:py-24 px-2 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 md:mb-16 flex flex-col md:flex-row items-start md:items-end justify-between px-2 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900">
                {query ? 'Scanned Results' : category ? categoriesData.find(c => c.id === category)?.name || category.replace('_', ' ') : 'Featured Assets'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group bg-white/40 backdrop-blur-2xl rounded-[2rem] p-2 transition-all duration-700 hover:-translate-y-2 flex flex-col overflow-hidden">
                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-100 relative shadow-inner">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-900">
                    {product.category.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-xs md:text-lg font-black tracking-tight mb-2 uppercase text-slate-900">{product.name}</h3>
                  <div className="mt-auto pt-4 flex justify-between items-end border-t border-slate-200/50">
                    <p className="text-sm md:text-2xl font-black text-slate-900 italic"><span className="text-purple-600 mr-1 text-[9px] not-italic">KSh</span>{product.retailPrice.toLocaleString()}</p>
                    <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 group-hover:bg-purple-600 group-hover:text-white transition-colors"><ShoppingCart size={18} /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- CLIENT PANEL SECTION --- */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] border-t border-white/60" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-[5.5rem] font-black uppercase tracking-tighter italic leading-[0.85] text-slate-900">
                Crafted for Space.<br/>
                <span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">Built on Trust.</span>
              </h2>
            </div>
            
            <Link href="/dashboard" className="block p-10 rounded-[3rem] bg-slate-900 text-white shadow-[0_30px_60px_rgba(0,0,0,0.2)] hover:shadow-[0_40px_80px_rgba(147,51,234,0.3)] transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] group-hover:bg-purple-600/40 transition-colors" />
               <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <History size={40} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-widest mb-1">Live Order Panel</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Track current acquisitions & view order history</p>
                  </div>
                  <ChevronRight className="ml-auto text-purple-400" />
               </div>
            </Link>

            <a href="tel:0797517565" className="inline-flex items-center gap-5 group p-2 pr-10 rounded-full bg-slate-200 text-slate-900 hover:bg-slate-300 transition-all">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white"><Phone size={20} /></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">Support Line</span>
                <span className="text-base font-black">+254 797 517 565</span>
              </div>
            </a>
          </div>

          <div className="relative aspect-square rounded-[3rem] overflow-hidden border-[6px] border-white shadow-2xl">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" alt="Premium Space" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/50 py-16 px-8 bg-white/30 backdrop-blur-3xl relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-black tracking-tighter italic text-slate-900">UNIQUE <span className="text-purple-700">ORGANIZERS</span></span>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">© 2026 - ALL RIGHTS RESERVED</p>
          </div>

          {/* SECONDARY ADMIN LINK IN FOOTER */}
          <div className="flex flex-col items-center gap-4">
             <Link 
               href="/admin/login" 
               className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
             >
                <UserCheck size={14} /> Staff Authorization Area
             </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}