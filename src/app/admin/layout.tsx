"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  BarChart3, 
  MessageSquare, 
  LogOut, 
  Megaphone 
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Common styles for nav links to ensure high visibility
  const navLinkStyles = "flex items-center gap-3 p-3 text-xs font-black uppercase tracking-tight rounded-xl transition-all duration-200 text-slate-900 hover:bg-slate-100 hover:pl-4 group";
  const iconStyles = "text-slate-900 group-hover:text-blue-600 transition-colors";

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen bg-white shadow-sm">
        <div className="px-2">
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
            Admin Panel <span className="text-blue-600">v2.1</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Core Management</p>
          
          <Link href="/admin/dashboard" className={navLinkStyles}>
            <Package size={18} className={iconStyles} /> Products
          </Link>
          
          <Link href="/admin/orders" className={navLinkStyles}>
            <LayoutDashboard size={18} className={iconStyles} /> Order Logs
          </Link>
          
          <Link href="/admin/delivery" className={navLinkStyles}>
            <Truck size={18} className={iconStyles} /> Delivery Tracking
          </Link>
          
          <p className="px-2 mt-8 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Marketing</p>
          <Link href="/admin/adverts" className={navLinkStyles}>
            <Megaphone size={18} className={iconStyles} /> Advert Manager
          </Link>
          
          <p className="px-2 mt-8 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Insights</p>
          <Link href="/admin/analytics" className={navLinkStyles}>
            <BarChart3 size={18} className={iconStyles} /> Real-time Analytics
          </Link>
          
          <Link href="/admin/feedback" className={navLinkStyles}>
            <MessageSquare size={18} className={iconStyles} /> Client Feedback
          </Link>
          
          <div className="mt-auto pt-10">
            <Link href="/" className="flex items-center gap-3 p-4 text-xs font-black uppercase tracking-widest rounded-2xl text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100">
              <LogOut size={18} /> Exit to Store
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 bg-slate-50/50">
        {children}
      </main>
    </div>
  );
}