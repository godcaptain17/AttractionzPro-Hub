'use client';
// app/admin/gallery/page.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Loader2, Upload, X, Image as ImageIcon, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { GALLERY_CATEGORIES } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase';
import type { GalleryItem } from '@/types';

const EMPTY_FORM = { title: '', category: 'Nail Art', after_image_url: '' };

export default function GalleryAdminPage() {
  const [items, setItems]       = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<GalleryItem | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/gallery?limit=100');
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch { toast.error('Failed to load gallery.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({ title: item.title, category: item.category, after_image_url: item.after_image_url });
    setModalOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext  = file.name.split('.').pop();
      const path = `gallery/image-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('gallery-images').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(path);
      setForm(p => ({ ...p, after_image_url: publicUrl }));
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally { setUploading(false); }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.after_image_url) { toast.error('Title and image are required.'); return; }
    setSaving(true);
    try {
      const isEdit = !!editing;
      const res = await fetch(isEdit ? `/api/gallery?id=${editing!.id}` : '/api/gallery', {
        method:  isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? 'Item updated.' : 'Item added.');
        setModalOpen(false);
        fetchItems();
      } else toast.error(data.error);
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Deleted.'); setItems(p => p.filter(i => i.id !== id)); }
      else toast.error(data.error);
    } catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Gallery</h1>
          <p className="font-body text-gray-500 text-sm mt-1">{filtered.length} items</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {GALLERY_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap border transition-all ${
              filter === cat ? 'bg-gold text-black border-gold' : 'border-black-border text-gray-500 hover:border-gold/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black-border">
          <ImageIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="font-body text-gray-600">No items in this category</p>
          <button onClick={openAdd} className="btn-outline-gold mt-4">Add First Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="luxury-card overflow-hidden group">
              <div className="aspect-square relative overflow-hidden">
                <Image src={item.after_image_url} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(item)}
                    className="w-7 h-7 bg-black/80 border border-gold/40 flex items-center justify-center hover:bg-gold hover:border-gold transition-all"
                  >
                    <Pencil className="w-3 h-3 text-gold group-hover:text-black" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={deleting === item.id}
                    className="w-7 h-7 bg-red-900/80 flex items-center justify-center hover:bg-red-600 transition-all"
                  >
                    {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Trash2 className="w-3 h-3 text-white" />}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-body text-white text-sm font-medium truncate">{item.title}</p>
                <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-black-soft border border-black-border">
            <div className="border-b border-black-border p-5 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">{editing ? 'Edit Item' : 'Add Gallery Item'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
            </div>
            <form onSubmit={saveItem} className="p-6 space-y-4">
              <div>
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Title *</label>
                <input className="luxury-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Gold Chrome Ombre" required />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Category</label>
                <select className="luxury-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {GALLERY_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Image *</label>
                <div className="flex items-start gap-3">
                  {form.after_image_url && (
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image src={form.after_image_url} alt="preview" fill className="object-cover" />
                      <button type="button" onClick={() => setForm(p => ({ ...p, after_image_url: '' }))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-3 border border-dashed border-black-border hover:border-gold/50 text-gray-500 hover:text-gold text-xs font-mono transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {form.after_image_url ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline-gold flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}