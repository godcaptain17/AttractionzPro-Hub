'use client';
// app/contact/page.tsx
import React, { useState } from 'react';
import Link  from 'next/link';
import { ArrowRight, MapPin, Phone, Clock, Instagram, Mail, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        toast.error(data.error || 'Failed to send.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-black-border bg-black-soft">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-gray-500 hover:text-gold transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
          </div>
          <span className="section-label">Get In Touch</span>
          <h1 className="font-display text-6xl text-white">Contact Us</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <p className="font-body text-gray-400 leading-relaxed mb-10">
              We'd love to hear from you. Whether you have questions about our services, want to book a special event, 
              or need assistance with an order, our team is here to help.
            </p>
            <div className="space-y-6">
              {[
                { icon: <MapPin className="w-5 h-5" />,     label: 'Address',      value: '2-14 James Robertson Rd, Surulere, Lagos 101241, Nigeria' },
                { icon: <Phone className="w-5 h-5" />,      label: 'Phone / WhatsApp', value: '+234 802 320 8886', href: 'tel:+2348023208886' },
                { icon: <Mail className="w-5 h-5" />,       label: 'Email',        value: 'hello@attractionzprohub.com', href: 'mailto:hello@attractionzprohub.com' },
                { icon: <Clock className="w-5 h-5" />,      label: 'Opening Hours', value: 'Mon – Sat: 9:00 AM – 6:00 PM' },
                { icon: <Instagram className="w-5 h-5" />,  label: 'Instagram',    value: '@attractionzprohub', href: 'https://instagram.com' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-5 border border-black-border hover:border-gold/30 transition-colors">
                  <span className="text-gold mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="font-body text-white text-sm hover:text-gold transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-body text-white text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mb-8">
                  <CheckCircle className="w-10 h-10 text-gold" />
                </div>
                <h2 className="font-display text-4xl text-white mb-4">Message Sent!</h2>
                <p className="font-body text-gray-400 mb-8">Thank you for reaching out. We'll respond within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-outline-gold">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 border border-black-border p-8">
                <h2 className="font-display text-3xl text-white mb-6">Send a Message</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Name *</label>
                    <input className="luxury-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Phone</label>
                    <input className="luxury-input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+234 XXX XXX XXXX" />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Email *</label>
                  <input className="luxury-input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Subject</label>
                  <select className="luxury-input" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))}>
                    <option>General Inquiry</option>
                    <option>Booking Question</option>
                    <option>Order Support</option>
                    <option>Complaint</option>
                    <option>Feedback</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Message *</label>
                  <textarea className="luxury-input resize-none" rows={6} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} placeholder="How can we help you?" required />
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
