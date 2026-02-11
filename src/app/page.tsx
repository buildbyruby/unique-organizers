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
  Package
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg" />
            UNIQUE <span className="text-gray-400 font-light italic">ORGANIZERS</span>
          </Link>
          
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-12">
            <form action="/" className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={14} />
              <input 
                name="q"
                defaultValue={query}
                placeholder="SEARCH ARCHIVES..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-purple-500/50 outline-none transition-all"
              />
            </form>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">
              <ShoppingBag size={14} /> Orders
            </Link>
            <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 flex items-center gap-2 transition">
              <LayoutDashboard size={14} /> Admin
            </Link>
            <Link
              href="/login"
              className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all transform active:scale-95"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-20 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-8">
                <Package size={12} className="animate-bounce" />
                Inventory Sync: Online
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8 uppercase italic">
                The <span className="text-gray-700 not-italic">Elite</span> <br />
                System <span className="bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">Stock.</span>
              </h1>
              <p className="text-gray-500 max-w-xl text-lg font-medium leading-relaxed">
                Direct access to high-tier organizational assets. Curated for performance, delivered across Nairobi within 24 hours.
              </p>
            </div>
            
            <div className="hidden md:block text-right">
                <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-4">Node Connectivity</div>
                <div className="flex items-center gap-3 justify-end">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold font-mono">254_SERVER_ACTIVE</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY FILTERS --- */}
      <section className="py-12 px-8 sticky top-[72px] z-40 backdrop-blur-md bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          <Link href="/" className={`whitespace-nowrap px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!category ? 'bg-white text-black' : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20'}`}>
            All Archives
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat}
              href={`/?category=${cat}`} 
              className={`whitespace-nowrap px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20'}`}
            >
              {cat.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </section>

      {/* --- PRODUCT GRID --- */}
      <section id="catalog" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.id}`}
                  className="group bg-[#0a0a0c] rounded-[2.5rem] border border-white/5 p-3 transition-all hover:border-purple-500/40 hover:bg-[#111114] flex flex-col"
                >
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-900 relative">
                    <img 
                      src={product.images[0] || "/api/placeholder/400/500"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">
                      {product.category}
                    </div>
                    {product.wholesalePrice > 0 && (
                        <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/40">
                            Wholesale Active
                        </div>
                    )}
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowUpRight size={20} />
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold tracking-tight mb-2 uppercase group-hover:text-purple-400 transition-colors">{product.name}</h3>
                    
                    <div className="mt-auto pt-6 flex justify-between items-end border-t border-white/5">
                      <div>
                        <span className="text-[9px] text-gray-500 block uppercase font-black tracking-widest mb-1">Retail Price</span>
                        <p className="text-xl font-black tracking-tighter text-white italic">
                          KSh {product.retailPrice.toLocaleString()}
                        </p>
                      </div>
                      
                      {product.wholesalePrice > 0 && (
                        <div className="text-right">
                           <span className="text-[8px] text-purple-400 block uppercase font-black mb-1">Save 50%+</span>
                           <div className="flex gap-0.5 justify-end">
                             <Star size={10} className="text-purple-500 fill-purple-500" />
                             <Star size={10} className="text-purple-500 fill-purple-500" />
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center border border-white/5 rounded-[3rem] bg-white/2">
                <Globe size={48} className="mx-auto mb-6 text-gray-800 animate-pulse" />
                <h3 className="text-xl font-black uppercase tracking-widest text-gray-600">No Assets Available</h3>
                <p className="text-gray-700 mt-2 font-bold uppercase text-[10px] tracking-widest">The current archive filter returned zero results.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- WHATSAPP FLOATING HUB --- */}
      <a 
        href="https://wa.me/25497517565" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 transition-all group"
      >
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 group-hover:hidden"></div>
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 py-24 px-8 bg-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h2 className="text-2xl font-black mb-6 tracking-tighter uppercase italic">Unique <span className="text-gray-600 font-light not-italic">Organizers</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-loose">
              Operational since 2024. Providing precision organizational tools for the modern lifestyle. Built on speed, trust, and quality.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[9px] uppercase tracking-[0.4em] text-purple-500 mb-6">Navigation</h4>
            <ul className="text-gray-500 text-[10px] font-black uppercase tracking-widest space-y-4">
              <li><Link href="/contact" className="hover:text-white transition">Support</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition">Logistics</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[9px] uppercase tracking-[0.4em] text-purple-500 mb-6">HQ</h4>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-loose">
              Nairobi, Kenya<br />
              Digital Distribution Hub<br />
              System ID: 254-ORGNZ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}