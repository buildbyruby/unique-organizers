"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Truck,
  Megaphone, BarChart2, MessageSquare, LogOut, Menu, X
} from "lucide-react";

const navItems = [
  { label: "Core Management", items: [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: ClipboardList, label: "Order Logs" },
    { href: "/admin/delivery", icon: Truck, label: "Delivery Tracking" },
  ]},
  { label: "Marketing", items: [
    { href: "/admin/adverts", icon: Megaphone, label: "Advert Manager" },
  ]},
  { label: "Insights", items: [
    { href: "/admin/analytics", icon: BarChart2, label: "Real-Time Analytics" },
    { href: "/admin/feedback", icon: MessageSquare, label: "Client Feedback" },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin" || pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-64 border-r border-slate-200 p-6
        flex flex-col gap-8 bg-white shadow-sm z-50 transition-transform duration-300
        lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:shadow-none
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Panel</span>
            </div>
            <span className="text-purple-600 font-black text-sm tracking-widest">V2.1</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 flex-1">
          {navItems.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2">{section.label}</p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={`${section.label}-${item.href}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-wide transition-all ${
                        active
                          ? "bg-slate-900 text-white shadow-lg"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-wide text-red-400 hover:bg-red-50 transition-all border border-red-100"
        >
          <LogOut size={16} /> Exit to Store
        </Link>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Menu size={20} />
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-700">Admin Panel</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
