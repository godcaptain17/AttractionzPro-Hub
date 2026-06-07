'use client';
// app/admin/layout.tsx — Persistent admin sidebar layout
import React, { useState, useEffect } from 'react';
import Link     from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, ShoppingBag, Package, MessageSquare,
  Image, Star, LogOut, Sparkles, Menu, X, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/admin/appointments', icon: Calendar,        label: 'Appointments' },
  { href: '/admin/products',     icon: Package,         label: 'Products'     },
  { href: '/admin/orders',       icon: ShoppingBag,     label: 'Orders'       },
  { href: '/admin/messages',     icon: MessageSquare,   label: 'Messages'     },
  { href: '/admin/gallery',      icon: Image,           label: 'Gallery'      },
  { href: '/admin/reviews',      icon: Star,            label: 'Reviews'      },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') return <>{children}</>;

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    toast.success('Logged out.');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-black-soft border-r border-black-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-black-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div>
            <p className="font-display text-base text-white leading-none">AttractionzPro</p>
            <p className="font-mono text-[9px] text-gold tracking-[0.3em] uppercase">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-gold/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-black-border space-y-2">
          <Link href="/" target="_blank" className="admin-nav-item text-xs">
            <Sparkles className="w-4 h-4" />
            <span>View Site</span>
          </Link>
          <button onClick={logout} className="admin-nav-item w-full text-left text-red-500 hover:text-red-400 hover:bg-red-900/10 border-l-transparent">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
  <div className="fixed inset-0 bg-black/60 z-40 lg:hidden pointer-events-auto" onClick={() => setSidebarOpen(false)} />
)}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-black-soft border-b border-black-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="font-mono text-xs text-gray-600 tracking-widest uppercase">
              {NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto relative z-10 pr-4">
          {children}
        </main>
      </div>
    </div>
  );
}
