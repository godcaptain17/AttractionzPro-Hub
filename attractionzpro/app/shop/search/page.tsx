'use client';
export const dynamic = 'force-dynamic';
// app/shop/search/page.tsx — Global search results
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart, ProductCard, CartDrawer, CheckoutModal } from '@/app/shop/_components';
import type { Product } from '@/types';

export default function SearchPage() {
  const searchParams  = useSearchParams();
  const initialQuery  = searchParams.get('q') || '';

  const [query, setQuery]       = useState(initialQuery);
  const [input, setInput]       = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successUrl, setSuccessUrl]     = useState('');

  const { cart, addToCart, removeFromCart, updateQty, clearCart, subtotal, itemCount } = useCart();

  const fetchProducts = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=200`);
      const data = await res.json();
      if (data.success) setProducts(data.data || []);
    } catch { toast.error('Failed to load products.'); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input.trim());
  };

  const handleSuccess = (url: string) => {
    setSuccessUrl(url);
    setCheckoutOpen(false);
    clearCart();
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-black-border bg-black-soft sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-gray-500 hover:text-gold transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <p className="font-mono text-[10px] text-gold tracking-widest uppercase">Search Results</p>
              <h1 className="font-display text-3xl text-white">{query ? `"${query}"` : 'Search'}</h1>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 border border-black-border px-4 py-3 hover:border-gold/50 transition-colors">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <span className="font-body text-white text-sm hidden sm:block">Cart</span>
            {itemCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-black font-mono text-[10px] flex items-center justify-center font-bold">{itemCount}</span>}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="luxury-input pl-11 pr-24" placeholder="Search all products..." value={input} onChange={e => setInput(e.target.value)} />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold text-black font-mono text-[10px] tracking-widest uppercase px-4 py-2 hover:bg-accent-yellow transition-colors">Go</button>
          </div>
        </form>

        {!query.trim() ? (
          <div className="text-center py-24">
            <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="font-display text-3xl text-gray-600">Type something to search</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-black-card border border-black-border animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="font-display text-3xl text-gray-600">No results for "{query}"</p>
            <p className="font-body text-gray-700 text-sm mt-2">Try a different search term or browse by category</p>
            <Link href="/shop" className="btn-outline-gold mt-8 inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" /> Browse Categories
            </Link>
          </div>
        ) : (
          <>
            <p className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mb-6">{products.length} result{products.length !== 1 ? 's' : ''} for "{query}"</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
            </div>
          </>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30 md:hidden">
          <button onClick={() => setCartOpen(true)} className="bg-gold text-black w-16 h-16 rounded-full flex items-center justify-center shadow-gold-glow relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black border-2 border-gold text-gold font-mono text-[10px] flex items-center justify-center font-bold">{itemCount}</span>
          </button>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} subtotal={subtotal} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} cart={cart} subtotal={subtotal} onSuccess={handleSuccess} />
    </div>
  );
}