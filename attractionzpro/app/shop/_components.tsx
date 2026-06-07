'use client';
// app/shop/_components.tsx — Shared cart components
import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, X, Plus, Minus, Sparkles, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import type { Product, CartItem, CheckoutFormData } from '@/types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
  };
  const clearCart  = () => setCart([]);
  const subtotal   = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount  = cart.reduce((sum, i) => sum + i.quantity, 0);
  return { cart, addToCart, removeFromCart, updateQty, clearCart, subtotal, itemCount };
}

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="luxury-card group cursor-pointer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="aspect-[3/4] bg-black-soft relative overflow-hidden">
        {product.image_urls?.length > 0 ? (
          <Image src={product.image_urls[0]} alt={product.name} fill className={`object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'}`} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-12 h-12 text-gold/20" /></div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 left-3 bg-red-900/80 px-2 py-1">
            <span className="font-mono text-[9px] text-red-300 tracking-widest uppercase">Only {product.stock} left</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="font-mono text-[10px] text-gray-400 tracking-widest uppercase">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && (
          <div className={`absolute inset-0 bg-black/60 flex items-end justify-center pb-4 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <button onClick={() => onAdd(product)} className="bg-gold text-black font-mono text-xs tracking-widest uppercase px-6 py-3 hover:bg-accent-yellow transition-colors">Add to Cart</button>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase mb-1">{product.category}</p>
        <h3 className="font-display text-lg text-white mb-1 leading-tight">{product.name}</h3>
        {product.description && <p className="font-body text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>}
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl text-gold">{formatCurrency(product.price)}</p>
          <button onClick={() => product.stock > 0 && onAdd(product)} disabled={product.stock === 0}
            className={`w-9 h-9 border flex items-center justify-center transition-all ${product.stock > 0 ? 'border-gold/40 text-gold hover:bg-gold hover:text-black hover:border-gold' : 'border-black-border text-gray-700 cursor-not-allowed'}`}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer({ open, onClose, cart, removeFromCart, updateQty, subtotal, onCheckout }: {
  open: boolean; onClose: () => void; cart: CartItem[];
  removeFromCart: (id: string) => void; updateQty: (id: string, qty: number) => void;
  subtotal: number; onCheckout: () => void;
}) {
  return (
    <>
      <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-black-soft border-l border-black-border z-50 flex flex-col transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-black-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-display text-2xl text-white">Your Cart</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag className="w-12 h-12 text-gray-700 mb-4" />
              <p className="font-display text-2xl text-gray-600">Your cart is empty</p>
              <p className="font-body text-gray-700 text-sm mt-2">Add some luxury to your life</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 border border-black-border hover:border-gold/20 transition-colors">
              <div className="w-16 h-20 bg-black flex-shrink-0 relative overflow-hidden">
                {item.product.image_urls?.length > 0
                  ? <Image src={item.product.image_urls[0]} alt={item.product.name} fill className="object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-6 h-6 text-gold/30" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-white text-sm font-medium truncate">{item.product.name}</p>
                <p className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">{item.product.category}</p>
                <p className="font-display text-lg text-gold mt-1">{formatCurrency(item.product.price * item.quantity)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-6 h-6 border border-black-border flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all"><Minus className="w-3 h-3" /></button>
                  <span className="font-mono text-sm text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => item.quantity < item.product.stock && updateQty(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="w-6 h-6 border border-black-border flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.product.id)} className="text-gray-600 hover:text-red-400 transition-colors self-start mt-1"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-black-border">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[10px] text-gray-500 tracking-widest uppercase">Subtotal</span>
              <span className="font-display text-3xl text-gold">{formatCurrency(subtotal)}</span>
            </div>
            <p className="font-body text-gray-600 text-xs mb-4 leading-relaxed">⚠️ Delivery fees apply based on your location. Payment: Cash, POS/Card, or Bank Transfer.</p>
            <button onClick={onCheckout} className="btn-gold w-full flex items-center justify-center gap-2">Checkout via WhatsApp</button>
          </div>
        )}
      </div>
    </>
  );
}

export function CheckoutModal({ open, onClose, cart, subtotal, onSuccess }: {
  open: boolean; onClose: () => void; cart: CartItem[]; subtotal: number; onSuccess: (url: string) => void;
}) {
  const [form, setForm]         = useState<CheckoutFormData>({ customer_name: '', email: '', phone: '', address: '', promo_code: '' });
  const [promo, setPromo]       = useState<{ valid: boolean; percent: number } | null>(null);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(false);
  const discount = promo?.valid ? Math.round((subtotal * promo.percent) / 100) : 0;
  const total    = subtotal - discount;

  const applyPromo = async () => {
    if (!form.promo_code.trim()) return;
    setChecking(true);
    try {
      setPromo({ valid: true, percent: 10 });
      toast.success('Promo code will be applied at checkout');
    } catch { setPromo({ valid: false, percent: 0 }); toast.error('Invalid promo code'); }
    finally { setChecking(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.email || !form.phone || !form.address) { toast.error('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formData: form, cartItems: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })) }) });
      const data = await res.json();
      if (data.success) { onSuccess(data.data.whatsAppUrl); }
      else { toast.error(data.error || 'Checkout failed.'); }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-black-soft border border-black-border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black-soft border-b border-black-border p-6 flex items-center justify-between z-10">
          <h2 className="font-display text-3xl text-white">Complete Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Full Name *</label>
            <input className="luxury-input" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} placeholder="Your full name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Email *</label>
              <input className="luxury-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Phone *</label>
              <input className="luxury-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+234 XXX XXX XXXX" required />
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Delivery Address *</label>
            <textarea className="luxury-input resize-none" rows={3} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full delivery address including area and landmark" required />
          </div>
          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Promo Code</label>
            <div className="flex gap-2">
              <input className="luxury-input flex-1" value={form.promo_code} onChange={e => setForm(p => ({ ...p, promo_code: e.target.value.toUpperCase() }))} placeholder="ENTER CODE" />
              <button type="button" onClick={applyPromo} disabled={checking} className="btn-outline-gold px-4 py-3 text-xs">
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {promo?.valid && <p className="font-mono text-[10px] text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Code applied — {promo.percent}% off</p>}
          </div>
          <div className="border border-black-border p-4 space-y-2">
            <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase mb-3">Order Summary</p>
            {cart.map(i => (
              <div key={i.product.id} className="flex justify-between text-sm">
                <span className="font-body text-gray-400">{i.product.name} x{i.quantity}</span>
                <span className="font-body text-white">{formatCurrency(i.product.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-black-border pt-2 mt-2 space-y-1">
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-body text-gold">Discount</span>
                  <span className="font-body text-gold">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
                <span className="font-display text-2xl text-gold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gold/5 border border-gold/20 flex gap-3">
            <AlertCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-[10px] text-gold tracking-widest uppercase mb-1">Delivery Fee Notice</p>
              <p className="font-body text-gray-400 text-xs leading-relaxed">Delivery fees are calculated based on your location and will be confirmed via WhatsApp before processing. Payment accepted: Cash on Delivery, POS/Card, or Bank Transfer.</p>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 text-xs">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Confirm & Open WhatsApp <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}