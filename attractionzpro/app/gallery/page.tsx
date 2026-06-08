'use client';
// app/gallery/page.tsx — Public gallery
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/lib/utils';
import type { GalleryItem } from '@/types';

export default function GalleryPage() {
  const [items, setItems]       = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (category !== 'All') params.set('category', category);
      const res  = await fetch(`/api/gallery?${params}`);
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

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
            <h1 className="font-display text-3xl text-white">Gallery</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10">
          {GALLERY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-3 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap border transition-all ${
                category === cat
                  ? 'bg-gold text-black border-gold'
                  : 'border-black-border text-gray-500 hover:border-gold/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="font-display text-3xl text-gray-600">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="luxury-card overflow-hidden group cursor-pointer"
                onClick={() => setSelected(item)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={item.after_image_url}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                </div>
                <div className="p-3">
                  <p className="font-body text-white text-sm font-medium truncate">{item.title}</p>
                  <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute -top-10 right-0 text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase">
              Close ✕
            </button>
            <div className="aspect-square relative">
              <Image src={selected.after_image_url} alt={selected.title} fill className="object-contain" />
            </div>
            <div className="bg-black-soft border border-black-border p-4 mt-1">
              <p className="font-display text-xl text-white">{selected.title}</p>
              <p className="font-mono text-[10px] text-gold tracking-widest uppercase mt-1">{selected.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}