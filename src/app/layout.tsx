import { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { CartProvider } from '@/context/CartContext'; // We just made this
import CartDrawer from '@/components/CartDrawer'; // We are about to make this

export const metadata: Metadata = {
  title: 'Unique Organizers | Premium Kenyan Stock',
  description: 'Shop the best organizers in Kenya. High quality, wholesale prices.',
  metadataBase: new URL('https://uniqueorganizers.co.ke'),
};

// --- NEW "UNIQUE" LOGO ---
// A stylized abstract 'U' made of organizational blocks
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6H14V14H6V6Z" fill="white" fillOpacity="0.2"/>
    <path d="M18 6H26V14H26V6Z" fill="white" fillOpacity="0.5"/>
    <path d="M6 18H14V26H6V18Z" fill="#7C3AED"/> 
    <path d="M18 18H26V26H18V18Z" fill="white"/>
  </svg>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased selection:bg-purple-500/30">
        <CartProvider>
          <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
             <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
               
               <Link href="/" className="flex items-center gap-4 group">
                 <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:border-purple-500/50 transition-colors">
                   <Logo />
                 </div>
                 <div className="flex flex-col">
                   <span className="font-black text-white tracking-tight text-lg leading-none">
                     UNIQUE
                   </span>
                   <span className="text-[10px] font-medium tracking-[0.3em] text-purple-400 uppercase">
                     Organizers
                   </span>
                 </div>
               </Link>
               
               <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 items-center">
                 <Link href="/admin" className="hover:text-purple-400 transition hidden md:block">System Node</Link>
                 {/* The CartDrawer will inject the Cart Button here automatically */}
               </div>
             </div>
          </nav>
          
          <main className="pt-24 min-h-screen">
            {children}
          </main>
          
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
