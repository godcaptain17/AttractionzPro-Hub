'use client';
// app/admin/products/page.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Plus, Pencil, Trash2, Upload, X, Check, Loader2,
  Package, Search, AlertTriangle, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, PRODUCT_CATEGORIES } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase';
import type { Product } from '@/types';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: 'Eau de Parfum', is_available: true, image_urls: [] as string[] };

function ProductModal({
  product, onClose, onSave,
}: { product: Partial<Product> | null; onClose: () => void; onSave: (data: Partial<Product>) => Promise<void>; }) {
  const [form, setForm]       = useState({ ...EMPTY_FORM, ...product });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext      = file.name.split('.').pop();
      const path     = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm(p => ({ ...p, image_urls: [...(p.image_urls || []), publicUrl] }));
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => setForm(p => ({ ...p, image_urls: p.image_urls.filter(u => u !== url) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required.'); return; }
    setSaving(true);
    try {
      await onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
      onClose();
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-black-soft border border-black-border max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black-soft border-b border-black-border p-5 flex items-center justify-between z-10">
          <h2 className="font-display text-2xl text-white">{product?.id ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Product Name *</label>
            <input className="luxury-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Chanel No. 5" required />
          </div>
          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Description</label>
            <textarea className="luxury-input resize-none" rows={3} value={form.description || ''} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Fragrance notes and details..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Price (₦) *</label>
              <input className="luxury-input" type="number" min="0" step="100" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="25000" required />
            </div>
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Stock</label>
              <input className="luxury-input" type="number" min="0" value={form.stock} onChange={e => setForm(p => ({...p, stock: e.target.value}))} placeholder="10" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Category</label>
              <select className="luxury-input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                {PRODUCT_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(p => ({...p, is_available: !p.is_available}))}
              className={`w-10 h-6 rounded-full relative transition-colors ${form.is_available ? 'bg-gold' : 'bg-black-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className="font-body text-sm text-gray-400">Available for sale</span>
          </div>

          {/* Image upload */}
          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {form.image_urls.map((url) => (
                <div key={url} className="relative w-20 h-20">
                  <Image src={url} alt="Product" fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(url)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 border border-dashed border-black-border hover:border-gold/50 flex items-center justify-center text-gray-600 hover:text-gold transition-all"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
            <p className="font-mono text-[10px] text-gray-700">JPG, PNG, WebP. Max 5MB per image.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline-gold flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {product?.id ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<Partial<Product> | null | false>(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/products?admin=true&limit=200');
      const data = await res.json();
      if (data.success) setProducts(data.data || []);
    } catch { toast.error('Failed to load products.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const saveProduct = async (data: Partial<Product>) => {
    const method = data.id ? 'PATCH' : 'POST';
    const res    = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    toast.success(data.id ? 'Product updated.' : 'Product created.');
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Product deleted.'); setProducts(p => p.filter(pr => pr.id !== id)); }
      else toast.error(data.error);
    } catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Products</h1>
          <p className="font-body text-gray-500 text-sm mt-1">{products.length} items in catalogue</p>
        </div>
        <button onClick={() => setModal({})} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Low stock warning */}
      {products.filter(p => p.stock > 0 && p.stock < 5).length > 0 && (
        <div className="flex items-center gap-3 p-4 border border-yellow-900/50 bg-yellow-900/10">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <p className="font-body text-yellow-400 text-sm">
            {products.filter(p => p.stock > 0 && p.stock < 5).length} product(s) have low stock (&lt; 5 units).
          </p>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="luxury-input pl-11" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><Package className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="font-body text-gray-600">No products found</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="luxury-card overflow-hidden">
              <div className="aspect-video relative bg-black-soft">
                {product.image_urls?.length > 0 ? (
                  <Image src={product.image_urls[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-8 h-8 text-gold/20" /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`px-2 py-1 font-mono text-[10px] tracking-widest uppercase ${product.is_available ? 'bg-green-900/80 text-green-400' : 'bg-red-900/80 text-red-400'}`}>
                    {product.is_available ? 'Active' : 'Hidden'}
                  </span>
                  {product.stock < 5 && <span className="px-2 py-1 bg-yellow-900/80 font-mono text-[10px] text-yellow-400 uppercase">Low Stock</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase">{product.category}</p>
                <h3 className="font-display text-xl text-white mt-1">{product.name}</h3>
                <p className="font-body text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="font-display text-2xl text-gold">{formatCurrency(product.price)}</p>
                  <p className="font-mono text-xs text-gray-500">{product.stock} in stock</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setModal(product)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-black-border hover:border-gold/50 text-gray-400 hover:text-gold transition-all text-xs font-mono">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    disabled={deleting === product.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-black-border hover:border-red-900/50 text-gray-400 hover:text-red-400 transition-all text-xs font-mono"
                  >
                    {deleting === product.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== false && (
        <ProductModal
          product={modal || {}}
          onClose={() => setModal(false)}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}
