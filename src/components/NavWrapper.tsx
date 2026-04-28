"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CartDrawer from '@/components/CartDrawer';

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && (
        <nav className="fixed top-0 w-full z-[50] bg-white border-b border-slate-100 h-20">
          <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center font-black text-white">U</div>
              <div className="flex flex-col">
                <span className="font-black text-black text-lg leading-none italic uppercase">UNIQUE</span>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Organizers</span>
              </div>
            </Link>
            <CartDrawer />
          </div>
        </nav>
      )}
      <main className={!isAdmin ? "pt-20 min-h-screen" : "min-h-screen"}>
        {children}
      </main>
    </>
  );
}
