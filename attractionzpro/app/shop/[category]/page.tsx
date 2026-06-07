'use client';
// app/shop/[category]/page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Search, ShoppingBag, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SHOP_CATEGORIES } from '@/lib/utils';
import { useCart, ProductCard, CartDrawer, CheckoutModal } from '@/app/shop/_components';
import type { Product } from '@/types';

export default function CategoryPage() {
  const params       = useParams();
  const slug         = params.category as string;
  const catInfo      = SHOP_CATEGORIES.find(c => c.slug === slug);
  const categoryLabel = catInfo?.label || slug;

  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [cartOpen, setCartOpen]   = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successUrl, setSuccessUrl]     = useState('');

  const { cart, addToCart, removeFromCart, updateQty, clearCart, subtotal, itemCount } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: categoryLabel, limit: '200' });
      if (search) params.set('search', search);
      const res  = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) setProducts(data.data || []);
    } catch { toast.error('Failed to load products.'); }
    finally { setLoading(false); }
  }, [categoryLabel, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSuccess = (url: string) => {
    setSuccessUrl(url);
    setCheckoutOpen(false);
    clearCart();
    window.open(url, '_blank');
  };

  if (successUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="font-display text-5xl text-white mb-4">Order Placed!</h2>
          <p className="font-body text-gray-400 mb-6">WhatsApp has opened to confirm your order. Our team will respond shortly.</p>
          <div className="flex flex-col gap-3">
            <a href={successUrl} target="_blank" rel="noopener noreferrer" className="btn-gold w-full text-center">Open WhatsApp</a>
            <Link href="/shop" onClick={() => setSuccessUrl('')} className="btn-outline-gold w-full text-center">Back to Shop</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-black-border bg-black-soft sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-gray-500 hover:text-gold transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <p className="font-mono text-[10px] text-gold tracking-widest uppercase">
                {catInfo?.icon} {catInfo ? 'Shop' : 'Shop'}
              </p>
              <h1 className="font-display text-3xl text-white">{categoryLabel}</h1>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 border border-black-border px-4 py-3 hover:border-gold/50 transition-colors">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <span className="font-body text-white text-sm hidden sm:block">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-black font-mono text-[10px] flex items-center justify-center font-bold">{itemCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search bar */}
        <div className="mb-10">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              className="luxury-input pl-11"
              placeholder={`Search ${categoryLabel.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-black-card border border-black-border animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-6xl mb-4 block">{catInfo?.icon || '🛍️'}</span>
            <p className="font-display text-3xl text-gray-600">No products yet</p>
            <p className="font-body text-gray-700 text-sm mt-2">
              {search ? 'Try a different search term' : 'Check back soon — new arrivals coming!'}
            </p>
            <Link href="/shop" className="btn-outline-gold mt-8 inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
          </div>
        )}
      </div>

      {/* Floating cart (mobile) */}
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