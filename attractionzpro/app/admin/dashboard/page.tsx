'use client';
// app/admin/dashboard/page.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, ShoppingBag, TrendingUp, Users,
  AlertTriangle, ArrowRight, Clock, CheckCircle, XCircle,
  Package, MessageSquare, RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { Product, Order, Appointment } from '@/types';

interface Stats {
  totalAppointments:   number;
  pendingAppointments: number;
  totalOrders:         number;
  totalRevenue:        number;
  unreadMessages:      number;
}

interface MonthlyData { month: string; revenue: number; orders: number; }

export default function DashboardPage() {
  const [stats, setStats]           = useState<Stats | null>(null);
  const [lowStock, setLowStock]     = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentAppts, setRecentAppts]   = useState<Appointment[]>([]);
  const [chartData, setChartData]       = useState<MonthlyData[]>([]);
  const [loading, setLoading]           = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apptRes, orderRes, msgRes, prodRes] = await Promise.all([
        fetch('/api/appointments?limit=100'),
        fetch('/api/orders?limit=100'),
        fetch('/api/messages?status=Unread&limit=50'),
        fetch('/api/products?admin=true&limit=100'),
      ]);

      const [apptData, orderData, msgData, prodData] = await Promise.all([
        apptRes.json(), orderRes.json(), msgRes.json(), prodRes.json(),
      ]);

      const appointments: Appointment[] = apptData.success ? apptData.data : [];
      const orders:       Order[]       = orderData.success ? orderData.data : [];
      const products:     Product[]     = prodData.success ? prodData.data : [];

      setStats({
        totalAppointments:   appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
        totalOrders:         orders.length,
        totalRevenue:        orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total_amount, 0),
        unreadMessages:      msgData.success ? msgData.count || 0 : 0,
      });

      setLowStock(products.filter(p => p.stock > 0 && p.stock < 5));
      setRecentOrders(orders.slice(0, 5));
      setRecentAppts(appointments.filter(a => a.status === 'Pending').slice(0, 5));

      // Build monthly revenue data (last 6 months)
      const now      = new Date();
      const monthly  = Array.from({ length: 6 }, (_, i) => {
        const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const label = d.toLocaleString('default', { month: 'short' });
        const mo    = d.getMonth();
        const yr    = d.getFullYear();
        const rev   = orders
          .filter(o => {
            const od = new Date(o.created_at);
            return od.getMonth() === mo && od.getFullYear() === yr && o.status !== 'Cancelled';
          })
          .reduce((s, o) => s + o.total_amount, 0);
        const cnt   = orders.filter(o => {
          const od = new Date(o.created_at);
          return od.getMonth() === mo && od.getFullYear() === yr;
        }).length;
        return { month: label, revenue: rev, orders: cnt };
      });
      setChartData(monthly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Appointments', value: stats.totalAppointments,   icon: <Calendar className="w-5 h-5" />,    delta: `${stats.pendingAppointments} pending`, href: '/admin/appointments', color: 'text-blue-400' },
    { label: 'Total Orders',       value: stats.totalOrders,         icon: <ShoppingBag className="w-5 h-5" />, delta: 'All time',                             href: '/admin/orders',       color: 'text-emerald-400' },
    { label: 'Total Revenue',      value: formatCurrency(stats.totalRevenue), icon: <TrendingUp className="w-5 h-5" />, delta: 'Excl. cancelled', href: '/admin/orders', color: 'text-gold' },
    { label: 'Unread Messages',    value: stats.unreadMessages,      icon: <MessageSquare className="w-5 h-5" />, delta: 'Awaiting reply', href: '/admin/messages', color: 'text-purple-400' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-gold animate-spin" />
          <p className="font-mono text-xs text-gray-500 tracking-widest uppercase">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Dashboard</h1>
          <p className="font-body text-gray-500 text-sm mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-sm font-body">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStock.length > 0 && (
        <div className="border border-yellow-900/50 bg-yellow-900/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-mono text-xs text-yellow-400 tracking-widest uppercase mb-1">Low Stock Alert</p>
            <p className="font-body text-gray-300 text-sm mb-2">The following products have fewer than 5 units remaining:</p>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(p => (
                <span key={p.id} className="bg-yellow-900/30 border border-yellow-800/50 px-3 py-1 font-mono text-[10px] text-yellow-300 tracking-wide">
                  {p.name} — {p.stock} left
                </span>
              ))}
            </div>
          </div>
          <Link href="/admin/products" className="text-yellow-500 hover:text-yellow-400 flex-shrink-0">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} href={card.href} className="luxury-card p-6 block group">
            <div className="flex items-start justify-between mb-4">
              <span className={`${card.color} p-2 bg-black-card rounded`}>{card.icon}</span>
              <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gold transition-colors group-hover:translate-x-1 duration-200" />
            </div>
            <p className="font-display text-3xl text-white mb-1">{card.value}</p>
            <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase">{card.label}</p>
            <p className="font-body text-gray-600 text-xs mt-1">{card.delta}</p>
          </Link>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="luxury-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl text-white">Revenue Overview</h2>
            <p className="font-body text-gray-500 text-sm">Last 6 months</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-px bg-gold" />
            <span className="font-mono text-[10px] text-gray-500">Revenue</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11, fontFamily: 'var(--font-space-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 0, fontFamily: 'var(--font-jost)' }}
                labelStyle={{ color: '#D4AF37', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Appointments */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-white">Pending Appointments</h2>
            <Link href="/admin/appointments" className="font-mono text-[10px] text-gold tracking-widest uppercase hover:underline">View All</Link>
          </div>
          {recentAppts.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-500/30 mb-2" />
              <p className="font-body text-gray-600 text-sm">No pending appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppts.map(appt => (
                <div key={appt.id} className="flex items-center gap-4 p-3 bg-black-card border border-black-border hover:border-gold/20 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-display text-sm">{appt.customer_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-white text-sm font-medium truncate">{appt.customer_name}</p>
                    <p className="font-body text-gray-500 text-xs truncate">{appt.service}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-[10px] text-gold">{appt.appointment_date}</p>
                    <p className="font-mono text-[10px] text-gray-600">{appt.appointment_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="luxury-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="font-mono text-[10px] text-gold tracking-widest uppercase hover:underline">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ShoppingBag className="w-8 h-8 text-gray-700 mb-2" />
              <p className="font-body text-gray-600 text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-3 bg-black-card border border-black-border hover:border-gold/20 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-white text-sm font-medium truncate">{order.customer_name}</p>
                    <p className="font-mono text-[10px] text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-lg text-gold">{formatCurrency(order.total_amount)}</p>
                    <span className={`badge-${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
