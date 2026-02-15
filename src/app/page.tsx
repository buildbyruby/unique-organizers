import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  ShoppingCart, 
  Search, 
  LayoutDashboard, 
  ArrowUpRight, 
  ShoppingBag,
  Globe,
  Star,
  Package,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  ChevronRight
} from 'lucide-react';
import { Metadata } from 'next';

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
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
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

  // Optimized Fetching: Filters by Category and Search Query
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

  const categories = [
    "ELECTRONICS", "CAR_EQUIPMENT", "BEAUTY_HAIR", 
    "FURNITURE", "DECOR", "KITCHEN", 
    "FOOD_SUPPLIES", "GIFTS_LIFESTYLE"
  ];

  return (
    <div 
      suppressHydrationWarning 
      className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans antialiased overflow-x-hidden"
    >
      {/* --- ANNOUNCEMENT BAR --- */}
      <div className="w-full bg-gradient-to-r from-purple-900 via-purple-600 to-purple-900 py-2 text-center flex items-center justify-center gap-2">
        <Sparkles size={12} className="text-purple-200 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Elevating Nairobi • 24H Rapid Dispatch Now Active</span>
      </div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="sticky top-0 w-full z-50 backdrop-blur-2xl border-b border-white/5 bg-black/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]" />
            <div className="flex flex-col">
              <span className="leading-none text-white transition-colors group-hover:text-purple-100">UNIQUE</span>
              <span className="text-[8px] font-black tracking-[0.4em] text-purple-400 uppercase hidden sm:block mt-0.5">Organizers</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-12">
            <form action="/" className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={14} />
              <input 
                name="q"
                defaultValue={query}
                placeholder="SEARCH PREMIUM ASSETS..." 
                className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:bg-white/[0.05] focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(147,51,234,0.1)] outline-none transition-all placeholder:text-gray-600"
              />
            </form>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              <ShoppingBag size={14} className="text-purple-500/70" /> Orders
            </Link>
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 flex items-center gap-2 transition-colors">
              <LayoutDashboard size={14} /> <span className="hidden md:inline">Admin</span>
            </Link>
            <Link
              href="/login"
              className="bg-white text-black px-5 md:px-7 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-lg shadow-white/5 active:scale-95"
            >
              Access
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 md:pt-36 pb-20 md:pb-32 px-6 overflow-hidden flex items-center min-h-[70vh]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] md:h-[600px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.3em] text-purple-300 shadow-[0_0_20px_rgba(147,51,234,0.15)]">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                Premium Stock Arrived
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter leading-[0.85] uppercase italic">
                Elevate Your <br />
                <span className="bg-gradient-to-br from-white via-purple-100 to-gray-500 bg-clip-text text-transparent drop-shadow-2xl">Space.</span>
              </h1>
              
              <p className="text-gray-400 max-w-xl text-lg md:text-xl font-medium leading-relaxed">
                Direct access to high-tier organizational and lifestyle assets. Curated for performance, designed for living.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="#catalog" className="bg-white text-black px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Explore Archives <ChevronRight size={16} />
                </Link>
                <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex -space-x-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px]`}>
                        <Star size={10} className="text-yellow-500"/>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">500+ Happy Spaces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST PILLARS --- */}
      <section className="border-y border-white/5 bg-black/40 backdrop-blur-lg relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex items-center gap-4 pt-4 md:pt-0 md:px-6 group">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-1">Curated Quality</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Premium materials only</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-6 md:pt-0 md:px-6 group">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Package size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-1">Rapid Dispatch</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">24H Delivery in Nairobi</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-6 md:pt-0 md:px-6 group">
            <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-1">Human Support</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Real people, real help</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY FILTERS --- */}
      <section className="py-6 px-4 md:px-8 sticky top-[58px] z-40 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5 shadow-2xl shadow-black">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2">
          <Link href="/" className={`whitespace-nowrap px-5 md:px-8 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!category ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'}`}>
            Complete Archive
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat}
              href={`/?category=${cat}`} 
              className={`whitespace-nowrap px-5 md:px-8 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-500' : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'}`}
            >
              {cat.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </section>

      {/* --- PRODUCT GRID (MOBILE 2-COLUMNS FIX) --- */}
      <section id="catalog" className="py-10 md:py-24 px-2 md:px-8 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-6 md:mb-10 flex items-end justify-between px-2">
            <div>
              <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter">
                {query ? 'Search Results' : category ? category.replace('_', ' ') : 'Featured Assets'}
              </h2>
              <p className="text-gray-500 text-[10px] md:text-sm mt-1 font-medium">Elevate your aesthetic.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"/> Live Inventory
            </div>
          </div>

          {products.length > 0 ? (
            /* FIX: Strict 2 columns on mobile, smaller gap for cleaner look */
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-8">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.id}`}
                  className="group bg-gradient-to-b from-[#0f0f12] to-[#0a0a0c] rounded-[1.2rem] md:rounded-[2.5rem] border border-white/5 p-1.5 md:p-3 transition-all duration-500 hover:border-purple-500/50 flex flex-col"
                >
                  {/* FIX: Square aspect ratio on mobile so cards are shorter */}
                  <div className="aspect-square md:aspect-[4/5] rounded-[0.8rem] md:rounded-[2rem] overflow-hidden bg-black relative shadow-inner">
                    <img 
                      src={product.images[0] || "/api/placeholder/400/500"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                    />
                    
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/80 backdrop-blur-md px-2 md:px-4 py-1 md:py-1.5 rounded-full border border-white/10 text-[6px] md:text-[9px] font-black uppercase tracking-widest text-gray-300">
                      {product.category.replace('_', ' ')}
                    </div>
                    
                    <div className="absolute bottom-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-white text-black rounded-full hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="p-2 md:p-5 flex-1 flex flex-col">
                    {/* FIX: Smaller font on mobile to prevent wrapping/clutter */}
                    <h3 className="text-[10px] md:text-lg font-black tracking-tight mb-1 md:mb-2 uppercase group-hover:text-purple-300 transition-colors line-clamp-1">{product.name}</h3>
                    
                    <div className="mt-auto pt-2 md:pt-5 flex justify-between items-end border-t border-white/5">
                      <div>
                        {/* Hidden "Price" label on mobile for cleaner look */}
                        <span className="hidden md:block text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Price</span>
                        <p className="text-xs md:text-xl font-black tracking-tighter text-white italic">
                          <span className="text-purple-400 mr-0.5 text-[8px] md:text-sm font-bold not-italic">KSh</span>
                          {product.retailPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-1.5 md:p-3 rounded-xl bg-white/5 md:bg-white/5 md:rounded-2xl group-hover:bg-purple-600 transition-colors border border-white/5">
                        <ShoppingCart size={14} className="text-white md:w-[18px] md:h-[18px]" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 md:py-48 text-center border-2 border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] bg-white/[0.01] backdrop-blur-sm mx-2">
                <Globe size={32} className="text-gray-500 mx-auto mb-6" />
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white mb-3 italic">Signal Lost</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest px-4 max-w-md mx-auto">
                  No items match your scanners. Reset filters to see the archive.
                </p>
                <Link href="/" className="inline-block mt-8 bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-colors">
                  Reset Scanners
                </Link>
            </div>
          )}
        </div>
      </section>

      {/* --- WARM / HUMAN ABOUT US SECTION --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="absolute -left-40 top-20 w-96 h-96 bg-purple-900/20 blur-[150px] rounded-full" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-[0.9]">
                Crafted for Your Space.<br/>
                <span className="text-purple-500">Delivered with Precision.</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                Unique Organizers is built on a simple promise: providing premium quality pieces that transform how you live and work. Real human curation meets rapid, reliable dispatch from the heart of Nairobi.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-purple-500/30 transition-colors group">
                <MapPin className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="font-black text-sm uppercase tracking-widest text-white mb-2">The Hub</h4>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  Accra Road, Sirikiwa<br />
                  First Floor, Shop 104<br />
                  Nairobi, Kenya
                </p>
              </div>
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-purple-500/30 transition-colors group">
                <Clock className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="font-black text-sm uppercase tracking-widest text-white mb-2">Operating Hours</h4>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  Monday — Saturday<br />
                  08:00 AM - 06:00 PM<br />
                  (Online 24/7)
                </p>
              </div>
            </div>

            <a 
              href="tel:0797517565" 
              className="inline-flex items-center gap-4 group p-1 pr-8 rounded-full bg-white text-black hover:bg-purple-600 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <div className="w-14 h-14 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-95 group-hover:bg-black/20 transition-all">
                <Phone size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Human Support line</span>
                <span className="text-sm font-black tracking-widest">+254 797 517 565</span>
              </div>
            </a>
          </div>

          <div className="relative aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/60 via-black/20 to-transparent z-10 transition-opacity duration-700 group-hover:opacity-40" />
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
              alt="Premium Organized Space" 
              className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 py-12 md:py-20 px-6 md:px-8 bg-[#020202]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-black tracking-tighter flex items-center gap-2 italic">
              UNIQUE <span className="text-purple-500">ORGANIZERS</span>
            </span>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em]">© 2026 - ALL RIGHTS RESERVED</p>
          </div>
          <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}