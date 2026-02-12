import { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unique Organizers | Premium Kenyan Stock',
  description: 'Shop the best organizers in Kenya. High quality, wholesale prices.',
  metadataBase: new URL('https://uniqueorganizers.co.ke'),
};

// --- INSTANT LOGO COMPONENT (No File Needed) ---
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#7C3AED"/>
    <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white" fillOpacity="0.9"/>
    <circle cx="16" cy="16" r="3" fill="#7C3AED"/>
  </svg>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
           <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
             <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
               <Logo />
               <span className="font-black text-white tracking-tighter text-lg hidden sm:block">
                 UNIQUE <span className="text-gray-500 font-light italic">ORGANIZERS</span>
               </span>
             </Link>
             
             <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
               <Link href="/" className="hover:text-white transition">Store</Link>
               <Link href="/admin" className="hover:text-purple-400 transition">Admin Node</Link>
             </div>
           </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
