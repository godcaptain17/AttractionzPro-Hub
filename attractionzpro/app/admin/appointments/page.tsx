'use client';
// app/admin/appointments/page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pending:   'badge-pending',
  Approved:  'badge-approved',
  Rejected:  'badge-rejected',
  Completed: 'badge-completed',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<AppointmentStatus | 'All'>('All');
  const [search, setSearch]             = useState('');
  const [updating, setUpdating]         = useState<string | null>(null);
  const [viewDate, setViewDate]         = useState(new Date());

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filter !== 'All') params.set('status', filter);
      const res  = await fetch(`/api/appointments?${params}`);
      const data = await res.json();
      if (data.success) setAppointments(data.data || []);
    } catch {
      toast.error('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id: string, status: AppointmentStatus, reason?: string) => {
    setUpdating(id);
    try {
      const res  = await fetch(`/api/appointments/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Appointment ${status.toLowerCase()}.`);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  // Calendar helpers
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel  = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const appointmentsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(a => a.appointment_date === dateStr);
  };

  const filtered = appointments.filter(a => {
    if (search) {
      const s = search.toLowerCase();
      return a.customer_name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s) || a.service.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Appointments</h1>
          <p className="font-body text-gray-500 text-sm mt-1">{appointments.length} total</p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="luxury-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-white">Calendar View</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:text-gold transition-colors text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-sm text-white tracking-wide min-w-[160px] text-center">{monthLabel}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:text-gold transition-colors text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center font-mono text-[10px] text-gray-600 tracking-widest uppercase py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {/* Days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayAppts = appointmentsForDate(day);
            const isToday  = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            return (
              <div key={day} className={`aspect-square p-1 border text-center relative ${isToday ? 'border-gold' : dayAppts.length > 0 ? 'border-gold/30' : 'border-black-border'}`}>
                <span className={`font-mono text-[11px] ${isToday ? 'text-gold font-bold' : 'text-gray-500'}`}>{day}</span>
                {dayAppts.length > 0 && (
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                    {dayAppts.slice(0, 3).map((a, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${a.status === 'Approved' ? 'bg-green-500' : a.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                    ))}
                    {dayAppts.length > 3 && <span className="text-[8px] text-gold">+{dayAppts.length - 3}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="luxury-input pl-11" placeholder="Search by name, email, or service..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['All', 'Pending', 'Approved', 'Rejected', 'Completed'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-3 font-mono text-[10px] tracking-widest uppercase border transition-all ${filter === s ? 'bg-gold text-black border-gold' : 'border-black-border text-gray-500 hover:border-gold/50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="font-body text-gray-600">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black-border">
                  {['Client', 'Service', 'Date & Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-gray-600 tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(appt => (
                  <tr key={appt.id} className="border-b border-black-border hover:bg-black-card transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-body text-white text-sm font-medium">{appt.customer_name}</p>
                      <p className="font-body text-gray-500 text-xs">{appt.email}</p>
                      <p className="font-body text-gray-600 text-xs">{appt.phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-body text-gray-300 text-sm">{appt.service}</p>
                      {appt.note && <p className="font-body text-gray-600 text-xs italic mt-1">"{appt.note}"</p>}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono text-sm text-white">{appt.appointment_date}</p>
                      <p className="font-mono text-xs text-gold">{appt.appointment_time}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={STATUS_COLORS[appt.status]}>{appt.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {appt.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(appt.id, 'Approved')}
                              disabled={updating === appt.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-900/30 border border-green-800/50 text-green-400 text-xs font-mono tracking-wide hover:bg-green-900/50 transition-all disabled:opacity-50"
                            >
                              {updating === appt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, 'Rejected')}
                              disabled={updating === appt.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 border border-red-800/50 text-red-400 text-xs font-mono tracking-wide hover:bg-red-900/50 transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {appt.status === 'Approved' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'Completed')}
                            disabled={updating === appt.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/30 border border-blue-800/50 text-blue-400 text-xs font-mono tracking-wide hover:bg-blue-900/50 transition-all"
                          >
                            <Clock className="w-3 h-3" /> Complete
                          </button>
                        )}
                        {(appt.status === 'Rejected' || appt.status === 'Completed') && (
                          <span className="font-mono text-[10px] text-gray-700 uppercase tracking-widest">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
