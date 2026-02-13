import { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Unique Organizers | Premium Kenyan Stock',
  description: 'Shop the best organizers in Kenya. High quality, wholesale prices.',
  metadataBase: new URL('https://uniqueorganizers.co.ke'),
};

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
      <head>
        {/* Cloudinary Widget Script for Admin Image Uploads */}
        <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
      </head>
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
               
               <div className="flex gap-6 items-center">
                 {/* Singular Secure Admin Path */}
                 <Link href="/login" className="flex items-center gap-2 group hidden sm:flex">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">System Node</span>
                 </Link>
                 {/* Cart injected by CartDrawer logic here automatically */}
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