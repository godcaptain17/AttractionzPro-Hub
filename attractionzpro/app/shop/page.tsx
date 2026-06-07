'use client';
// app/shop/page.tsx — Shop landing page
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShoppingBag } from 'lucide-react';
import { SHOP_CATEGORIES } from '@/lib/utils';

export default function ShopPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/shop/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-black-border bg-black-soft sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gold transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <div>
            <p className="font-mono text-[10px] text-gold tracking-widest uppercase">AttractionzPro Hub</p>
            <h1 className="font-display text-3xl text-white">Shop</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Global search */}
        <form onSubmit={handleSearch} className="mb-16">
          <p className="font-mono text-[10px] text-gold tracking-widest uppercase text-center mb-4">Search Everything</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              className="luxury-input pl-12 pr-36 py-4 text-base w-full"
              placeholder="Search across all categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-black font-mono text-[10px] tracking-widest uppercase px-5 py-2.5 hover:bg-accent-yellow transition-colors">
              Search
            </button>
          </div>
        </form>

        {/* Category heading */}
        <div className="text-center mb-12">
          <span className="section-label">Browse by Category</span>
          <h2 className="font-display text-4xl md:text-5xl text-white">What are you shopping for?</h2>
          <div className="gold-divider" />
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SHOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="luxury-card p-8 group flex flex-col items-center text-center hover:border-gold/50 transition-all duration-300"
            >
              <span className="text-5xl mb-5 block group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <h3 className="font-display text-xl text-white mb-2 group-hover:text-gold transition-colors duration-300">{cat.label}</h3>
              <p className="font-body text-gray-500 text-sm leading-relaxed mb-5">{cat.desc}</p>
              <div className="flex items-center gap-1 text-gold/0 group-hover:text-gold transition-all duration-300 font-mono text-[10px] tracking-widest uppercase">
                Browse <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}