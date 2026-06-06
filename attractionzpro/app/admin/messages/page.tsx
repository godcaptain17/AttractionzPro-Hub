'use client';
// app/admin/messages/page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, Send, ChevronDown, ChevronUp, Loader2, MailOpen, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Message, MessageStatus } from '@/types';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<MessageStatus | 'All'>('All');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replies, setReplies]   = useState<Record<string, string>>({});
  const [sending, setSending]   = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filter !== 'All') params.set('status', filter);
      const res  = await fetch(`/api/messages?${params}`);
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch { toast.error('Failed to load messages.'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (id: string) => {
    const res  = await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'Read' }) });
    const data = await res.json();
    if (data.success) setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'Read' } : m));
  };

  const sendReply = async (msg: Message) => {
    const reply = replies[msg.id]?.trim();
    if (!reply) { toast.error('Please write a reply first.'); return; }
    setSending(msg.id);
    try {
      const res  = await fetch('/api/messages', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, status: 'Read', admin_reply: reply }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Reply sent via email!');
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, admin_reply: reply, status: 'Read' } : m));
        setReplies(prev => ({ ...prev, [msg.id]: '' }));
      } else toast.error(data.error);
    } catch { toast.error('Failed to send reply.'); }
    finally { setSending(null); }
  };

  const openMessage = async (id: string) => {
    const current = messages.find(m => m.id === id);
    if (current?.status === 'Unread') await markRead(id);
    setExpanded(expanded === id ? null : id);
  };

  const filtered = messages.filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || m.subject.toLowerCase().includes(s);
  });

  const unreadCount = messages.filter(m => m.status === 'Unread').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Message Center</h1>
          <p className="font-body text-gray-500 text-sm mt-1">
            {messages.length} total
            {unreadCount > 0 && <span className="ml-2 text-gold">· {unreadCount} unread</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="luxury-input pl-11" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['All', 'Unread', 'Read'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-5 py-3 font-mono text-[10px] tracking-widest uppercase border transition-all ${filter === s ? 'bg-gold text-black border-gold' : 'border-black-border text-gray-500 hover:border-gold/50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12"><MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="font-body text-gray-600">No messages found</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(msg => (
            <div key={msg.id} className={`luxury-card overflow-hidden transition-all ${msg.status === 'Unread' ? 'border-gold/30' : ''}`}>
              {/* Header */}
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => openMessage(msg.id)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.status === 'Unread' ? 'bg-gold/20' : 'bg-black-card'}`}>
                  {msg.status === 'Unread'
                    ? <Mail className="w-4 h-4 text-gold" />
                    : <MailOpen className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">From</p>
                    <p className={`font-body text-sm truncate ${msg.status === 'Unread' ? 'text-white font-semibold' : 'text-gray-300'}`}>{msg.name}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Subject</p>
                    <p className="font-body text-gray-300 text-sm truncate">{msg.subject}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Date</p>
                    <p className="font-body text-gray-500 text-xs">{new Date(msg.created_at).toLocaleDateString('en-NG')}</p>
                  </div>
                  <div>
                    <span className={`badge-${msg.status.toLowerCase()}`}>{msg.status}</span>
                    {msg.admin_reply && <p className="font-mono text-[9px] text-green-500 mt-1">Replied</p>}
                  </div>
                </div>
                {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </button>

              {/* Expanded */}
              {expanded === msg.id && (
                <div className="border-t border-black-border p-5 space-y-5 bg-black-card">
                  <div className="grid grid-cols-2 gap-4">
                    {[['Name', msg.name], ['Email', msg.email], ...(msg.phone ? [['Phone', msg.phone]] : [])].map(([l, v]) => (
                      <div key={l}><p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">{l}</p><p className="font-body text-gray-300 text-sm">{v}</p></div>
                    ))}
                  </div>

                  {/* Message */}
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Message</p>
                    <div className="bg-black border border-black-border p-4">
                      <p className="font-body text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>

                  {/* Previous reply */}
                  {msg.admin_reply && (
                    <div>
                      <p className="font-mono text-[10px] text-green-600 uppercase tracking-widest mb-2">Your Previous Reply</p>
                      <div className="bg-green-900/10 border border-green-900/30 p-4">
                        <p className="font-body text-green-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.admin_reply}</p>
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                      {msg.admin_reply ? 'Send Another Reply' : 'Reply to this Message'}
                    </p>
                    <textarea
                      className="luxury-input resize-none"
                      rows={4}
                      placeholder={`Reply to ${msg.name}...`}
                      value={replies[msg.id] || ''}
                      onChange={e => setReplies(prev => ({ ...prev, [msg.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => sendReply(msg)}
                      disabled={sending === msg.id}
                      className="btn-gold mt-3 flex items-center gap-2"
                    >
                      {sending === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Reply via Email
                    </button>
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
