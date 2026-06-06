'use client';
// app/admin/reviews/page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'pending' | 'approved'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/reviews?limit=100');
      const data = await res.json();
      if (data.success) setReviews(data.data || []);
    } catch { toast.error('Failed to load reviews.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateApproval = async (id: string, is_approved: boolean) => {
    setUpdating(id);
    try {
      const res  = await fetch('/api/reviews', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, is_approved }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(is_approved ? 'Review approved & published.' : 'Review hidden.');
        setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved } : r));
      } else toast.error(data.error);
    } catch { toast.error('Update failed.'); }
    finally { setUpdating(null); }
  };

  const filtered = reviews.filter(r => {
    if (filter === 'approved') return r.is_approved;
    if (filter === 'pending')  return !r.is_approved;
    return true;
  });

  const pendingCount  = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">Reviews</h1>
        <p className="font-body text-gray-500 text-sm mt-1">
          {pendingCount} pending approval · {approvedCount} published
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { key: 'pending',  label: `Pending (${pendingCount})` },
          { key: 'approved', label: `Approved (${approvedCount})` },
          { key: 'all',      label: `All (${reviews.length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-3 font-mono text-[10px] tracking-widest uppercase border transition-all ${
              filter === key ? 'bg-gold text-black border-gold' : 'border-black-border text-gray-500 hover:border-gold/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-black-border">
          <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="font-body text-gray-600">No reviews in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className={`luxury-card p-6 flex flex-col gap-4 ${
                !review.is_approved ? 'border-yellow-900/40' : 'border-green-900/20'
              }`}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-gray-700'}`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="font-body text-gray-300 text-sm leading-relaxed flex-1 italic">
                "{review.comment}"
              </p>

              {/* Author + date */}
              <div className="flex items-center gap-3 pt-3 border-t border-black-border">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-display text-sm">{review.customer_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-white text-sm font-medium truncate">{review.customer_name}</p>
                  <p className="font-mono text-[10px] text-gray-600">
                    {new Date(review.created_at).toLocaleDateString('en-NG')}
                  </p>
                </div>
                <span className={review.is_approved ? 'badge-approved' : 'badge-pending'}>
                  {review.is_approved ? 'Live' : 'Pending'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!review.is_approved ? (
                  <button
                    onClick={() => updateApproval(review.id, true)}
                    disabled={updating === review.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-900/30 border border-green-800/50 text-green-400 text-xs font-mono tracking-wide hover:bg-green-900/50 transition-all disabled:opacity-50"
                  >
                    {updating === review.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <CheckCircle className="w-3 h-3" />}
                    Approve & Publish
                  </button>
                ) : (
                  <button
                    onClick={() => updateApproval(review.id, false)}
                    disabled={updating === review.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-900/30 border border-red-800/50 text-red-400 text-xs font-mono tracking-wide hover:bg-red-900/50 transition-all disabled:opacity-50"
                  >
                    {updating === review.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <XCircle className="w-3 h-3" />}
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
