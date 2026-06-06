'use client';
// app/admin/orders/page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<OrderStatus | 'All'>('All');
  const [search, setSearch]   = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filter !== 'All') params.set('status', filter);
      const res  = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch { toast.error('Failed to load orders.'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    try {
      const res  = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order marked as ${status}`);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      } else toast.error(data.error);
    } catch { toast.error('Update failed.'); }
    finally { setUpdating(null); }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.customer_name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s) || o.id.includes(s);
  });

  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Orders</h1>
          <p className="font-body text-gray-500 text-sm mt-1">
            {orders.length} total · <span className="text-gold">{formatCurrency(totalRevenue)}</span> revenue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="luxury-input pl-11" placeholder="Search by name, email, or order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-3 font-mono text-[10px] tracking-widest uppercase border transition-all whitespace-nowrap ${filter === s ? 'bg-gold text-black border-gold' : 'border-black-border text-gray-500 hover:border-gold/50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><ShoppingBag className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="font-body text-gray-600">No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="luxury-card overflow-hidden">
              {/* Order header */}
              <button
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-black-card/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Order ID</p>
                    <p className="font-mono text-sm text-gold">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Customer</p>
                    <p className="font-body text-white text-sm truncate">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Total</p>
                    <p className="font-display text-xl text-gold">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Status</p>
                    <span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </div>
                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </button>

              {/* Expanded details */}
              {expanded === order.id && (
                <div className="border-t border-black-border p-5 space-y-4 bg-black-card">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      ['Email', order.email],
                      ['Phone', order.phone],
                      ['Date', new Date(order.created_at).toLocaleDateString('en-NG')],
                      ['Address', order.address],
                      ...(order.promo_code ? [['Promo', `${order.promo_code} (−${formatCurrency(order.discount_amount || 0)})`]] : []),
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">{label}</p>
                        <p className="font-body text-gray-300 text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-black border border-black-border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-black-soft flex items-center justify-center">
                                {(item as any).product?.image_urls?.[0] ? (
                                  <img src={(item as any).product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                                ) : <ShoppingBag className="w-4 h-4 text-gray-600" />}
                              </div>
                              <span className="font-body text-gray-300 text-sm">{(item as any).product?.name || 'Product'}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-xs text-gray-500">x{item.quantity}</p>
                              <p className="font-body text-white text-sm">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status actions */}
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-3">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.filter(s => s !== order.status).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          disabled={updating === order.id}
                          className={`px-4 py-2 border font-mono text-[10px] uppercase tracking-widest transition-all ${
                            s === 'Cancelled' ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' :
                            s === 'Delivered' ? 'border-green-900/50 text-green-400 hover:bg-green-900/20' :
                            'border-black-border text-gray-400 hover:border-gold/50 hover:text-gold'
                          } disabled:opacity-50`}
                        >
                          {updating === order.id ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                          Mark {s}
                        </button>
                      ))}

                      {/* Reopen WhatsApp */}
                      <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348023208886'}?text=${encodeURIComponent(`Following up on Order #${order.id.slice(0,8).toUpperCase()} for ${order.customer_name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-black-border text-gray-400 hover:border-green-700/50 hover:text-green-400 transition-all font-mono text-[10px] uppercase tracking-widest flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
