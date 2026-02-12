import Link from 'next/link';
import prisma from '@/lib/prisma';
import { 
  ShoppingCart, 
  Zap, 
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
    /* FIX: suppressHydrationWarning added here. 
       This stops the error caused by browser extensions or locale mismatches 
       on your retail price formatting.
    */
    <div 
      suppressHydrationWarning 
      className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans antialiased"
    >
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg group-hover:rotate-12 transition-transform duration-300" />
            <span className="flex">UNIQUE <span className="text-gray-400 font-light italic ml-1 hidden sm:block">ORGANIZERS</span></span>
          </Link>
          
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-12">
            <form action="/" className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={14} />
              <input 
                name="q"
                defaultValue={query}
                placeholder="SEARCH ARCHIVES..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
              />
            </form>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">
              <ShoppingBag size={14} /> Orders
            </Link>
            <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 flex items-center gap-2 transition">
              <LayoutDashboard size={14} /> <span className="hidden md:inline">Admin</span>
            </Link>
            <Link
  href="/login"
  className="bg-white text-black px-4 md:px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
>
  Access
</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 md:pt-48 pb-12 md:pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] md:h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-6 md:mb-8">
                <Package size={12} className="animate-bounce" />
                Inventory Sync: Online
              </div>
              <h1 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.9] mb-6 md:mb-8 uppercase italic">
                The <span className="text-gray-700 not-italic">Elite</span> <br />
                System <span className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">Stock.</span>
              </h1>
              <p className="text-gray-500 max-w-xl text-base md:text-lg font-medium leading-relaxed">
                Direct access to high-tier organizational assets. Curated for performance, delivered across Nairobi within 24 hours.
              </p>
            </div>
            
            <div className="hidden md:block text-right">
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-4">Node Connectivity</div>
                <div className="flex items-center gap-3 justify-end">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold font-mono text-green-500/80">254_SERVER_ACTIVE</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY FILTERS --- */}
      <section className="py-6 px-4 md:px-8 sticky top-[68px] md:top-[72px] z-40 backdrop-blur-md bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          <Link href="/" className={`whitespace-nowrap px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${!category ? 'bg-white text-black' : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20'}`}>
            All Archives
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat}
              href={`/?category=${cat}`} 
              className={`whitespace-nowrap px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20'}`}
            >
              {cat.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </section>

      {/* --- PRODUCT GRID --- */}
      <section id="catalog" className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.id}`}
                  className="group bg-[#0a0a0c] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 p-2 md:p-3 transition-all hover:border-purple-500/40 hover:bg-[#111114] flex flex-col"
                >
                  <div className="aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-900 relative">
                    <img 
                      src={product.images[0] || "/api/placeholder/400/500"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                    />
                    
                    {product.colors && product.colors.length > 0 && (
                      <div className="absolute bottom-4 left-4 flex gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                        {product.colors.slice(0, 4).map((color, idx) => (
                          <div 
                            key={idx} 
                            style={{ backgroundColor: color }} 
                            className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                          />
                        ))}
                      </div>
                    )}

                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">
                      {product.category}
                    </div>
                    
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                        <ArrowUpRight size={20} />
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <h3 className="text-base md:text-lg font-bold tracking-tight mb-2 uppercase group-hover:text-purple-400 transition-colors line-clamp-1">{product.name}</h3>
                    
                    <div className="mt-auto pt-4 flex justify-between items-end border-t border-white/5">
                      <div>
                        <span className="text-[8px] text-gray-500 block uppercase font-black tracking-widest mb-1">Retail Price</span>
                        <p className="text-lg md:text-xl font-black tracking-tighter text-white italic">
                          KSh {product.retailPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-500/10 p-2 rounded-lg group-hover:bg-purple-500 transition-colors">
                        <ShoppingCart size={14} className="text-purple-400 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 md:py-40 text-center border border-white/5 rounded-[2rem] md:rounded-[3rem] bg-white/[0.02]">
                <Globe size={48} className="mx-auto mb-6 text-gray-800 animate-pulse" />
                <h3 className="text-xl font-black uppercase tracking-widest text-gray-600">No Assets Available</h3>
                <p className="text-gray-700 mt-2 font-bold uppercase text-[10px] tracking-widest px-4">The current archive filter returned zero results. Adjust your parameters.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- PROFESSIONAL ABOUT US SECTION --- */}
      <section className="py-20 px-6 border-t border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                Precision <span className="text-purple-500">Logistics.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Unique Organizers is more than a storefront—it is a distribution node for high-tier hardware and lifestyle assets. Based in the heart of Nairobi, we prioritize authentic sourcing and rapid deployment.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <MapPin className="text-purple-500" size={24} />
                <h4 className="font-black text-xs uppercase tracking-widest">Headquarters</h4>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">
                  Accra Road, Sirikiwa Business Centre<br />
                  First Floor, Shop 104<br />
                  Nairobi, Kenya
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <Clock className="text-purple-500" size={24} />
                <h4 className="font-black text-xs uppercase tracking-widest">Working Hours</h4>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">
                  Mon — Sat: 08:00 - 18:00
                </p>
              </div>
            </div>

            <a 
              href="tel:0797517565" 
              className="inline-flex items-center gap-4 group p-1 pr-6 rounded-full bg-purple-600 hover:bg-purple-500 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Phone size={20} fill="white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Call Dispatch: 0797517565</span>
            </a>
          </div>

          <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[3rem] overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-black z-10" />
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80" 
              alt="Technology Hub" 
              className="w-full h-full object-cover grayscale opacity-50"
            />
            <div className="absolute bottom-12 left-12 z-20 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">System ID</div>
              <div className="text-4xl font-black tracking-tighter">254_NBO_NODE</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 py-16 md:py-24 px-6 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[8px] font-bold text-gray-700 uppercase tracking-[0.5em]">© 2026 UNIQUE ORGANIZERS - ALL RIGHTS RESERVED</p>
          <div className="flex gap-6">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">System Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}