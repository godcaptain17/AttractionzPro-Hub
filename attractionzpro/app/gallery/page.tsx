'use client';
// app/gallery/page.tsx — Before & After Gallery
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link  from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { GALLERY_CATEGORIES } from '@/lib/utils';
import type { GalleryItem } from '@/types';

// ── Before / After Slider ────────────────────────────────────
function BeforeAfterSlider({ before, after, title }: { before: string; after: string; title: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging     = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onMouseMove = (e: MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
  const onTouchMove = (e: TouchEvent) => { if (dragging.current) updatePos(e.touches[0].clientX); };
  const stopDrag    = () => { dragging.current = false; };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, []);

  return (
    <div className="group">
      <div
        ref={containerRef}
        className="relative aspect-square overflow-hidden cursor-col-resize select-none bg-black-card"
        onMouseDown={(e) => { dragging.current = true; updatePos(e.clientX); }}
        onTouchStart={(e) => { dragging.current = true; updatePos(e.touches[0].clientX); }}
      >
        {/* After (base) */}
        <div className="absolute inset-0">
          {after ? (
            <Image src={after} alt={`After: ${title}`} fill className="object-cover pointer-events-none" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-black-card flex items-center justify-center">
              <span className="font-display text-4xl text-gold/30">After</span>
            </div>
          )}
        </div>

        {/* Before (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          {before ? (
            <Image src={before} alt={`Before: ${title}`} fill className="object-cover pointer-events-none" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="font-display text-4xl text-gray-500">Before</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gold/80 shadow-gold z-10"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gold border-2 border-white/20 flex items-center justify-center shadow-lg z-20 cursor-col-resize">
            <SlidersHorizontal className="w-4 h-4 text-black" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 pointer-events-none">
          <span className="font-mono text-[10px] text-white tracking-widest uppercase">Before</span>
        </div>
        <div className="absolute top-3 right-3 bg-gold/90 px-2 py-1 pointer-events-none">
          <span className="font-mono text-[10px] text-black tracking-widest uppercase font-bold">After</span>
        </div>
      </div>
      {/* Title */}
      <div className="p-4 border border-t-0 border-black-border group-hover:border-gold/20 transition-colors">
        <p className="font-display text-xl text-white">{title}</p>
      </div>
    </div>
  );
}

// ── Single After Image (no before) ───────────────────────────
function SingleCard({ item }: { item: GalleryItem }) {
  return (
    <div className="group luxury-card overflow-hidden">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={item.after_image_url}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="font-display text-xl text-white">{item.title}</p>
        </div>
      </div>
      <div className="p-4 border-t border-black-border">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-white">{item.title}</p>
          <span className="font-mono text-[10px] text-gold tracking-widest uppercase">{item.category}</span>
        </div>
      </div>
    </div>
  );
}

// ── Fallback demo items ───────────────────────────────────────
const DEMO_ITEMS: GalleryItem[] = [
  { id: '1', title: 'Gold Foil French Tips',    before_image_url: null, after_image_url: '', category: 'Nail Art',     created_at: '' },
  { id: '2', title: 'Marble Effect Gel Set',    before_image_url: null, after_image_url: '', category: 'Gel Nails',   created_at: '' },
  { id: '3', title: 'Ombre Chrome Ombre',       before_image_url: null, after_image_url: '', category: 'Nail Art',     created_at: '' },
  { id: '4', title: '3D Floral Acrylics',       before_image_url: null, after_image_url: '', category: 'Acrylics',    created_at: '' },
  { id: '5', title: 'Nude Almond Gel Set',      before_image_url: null, after_image_url: '', category: 'Gel Nails',   created_at: '' },
  { id: '6', title: 'Crystal Encrusted Tips',   before_image_url: null, after_image_url: '', category: 'Nail Designs', created_at: '' },
];

// ── Page ─────────────────────────────────────────────────────
export default function GalleryPage() {
  const [items, setItems]       = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const params = category !== 'All' ? `?category=${category}` : '';
        const res    = await fetch(`/api/gallery${params}`);
        const data   = await res.json();
        if (data.success) setItems(data.data);
      } catch {
        toast.error('Failed to load gallery.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [category]);

  const displayItems = items.length > 0 ? items : DEMO_ITEMS;
  const withBefore   = displayItems.filter(i => i.before_image_url);
  const withoutBefore = displayItems.filter(i => !i.before_image_url);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-black-border bg-black-soft">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="text-gray-500 hover:text-gold transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <span className="font-mono text-[10px] text-gray-700">/ gallery</span>
          </div>
          <span className="section-label">Our Work</span>
          <h1 className="font-display text-6xl text-white mb-4">Gallery</h1>
          <p className="font-body text-gray-500 max-w-xl">
            Explore our portfolio of nail artistry. Drag the slider on transformation pieces to see the before & after.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10">
          {GALLERY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap transition-all border ${
                category === cat ? 'bg-gold text-black border-gold' : 'border-black-border text-gray-500 hover:border-gold/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-black-card border border-black-border animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Before/After section */}
            {withBefore.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-display text-3xl text-white">Transformations</h2>
                  <span className="font-mono text-[10px] text-gold tracking-widest uppercase px-3 py-1 border border-gold/30">Drag to Compare</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {withBefore.map(item => (
                    <BeforeAfterSlider
                      key={item.id}
                      before={item.before_image_url!}
                      after={item.after_image_url}
                      title={item.title}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular gallery */}
            {withoutBefore.length > 0 && (
              <div>
                {withBefore.length > 0 && (
                  <h2 className="font-display text-3xl text-white mb-6">More Work</h2>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {withoutBefore.map(item => (
                    <SingleCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Demo placeholder notice */}
            {items.length === 0 && (
              <div className="text-center mt-12 p-8 border border-dashed border-black-border">
                <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-3" />
                <p className="font-body text-gray-600 text-sm">Gallery content is managed through the admin dashboard.</p>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 text-center border-t border-black-border pt-12">
          <p className="font-body text-gray-500 mb-6">Love what you see? Book your own transformation.</p>
          <Link href="/book" className="btn-gold">Book an Appointment</Link>
        </div>
      </div>
    </div>
  );
}
