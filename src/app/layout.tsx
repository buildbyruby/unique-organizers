"use client"
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased selection:bg-purple-100`}>
        <CartProvider>
          {!isAdmin && (
            <nav className="fixed top-0 w-full z-[50] bg-white border-b border-slate-100 h-20">
              <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                
                {/* LOGO */}
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-black text-white">
                    U
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-black text-lg leading-none italic uppercase">UNIQUE</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Organizers</span>
                  </div>
                </Link>
                
                {/* CART INTERFACE */}
                <CartDrawer />
              </div>
            </nav>
          )}
          
          <main className={!isAdmin ? "pt-20 min-h-screen" : "min-h-screen"}>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}