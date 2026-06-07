'use client';
// app/page.tsx — AttractionzPro Hub Homepage
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, MapPin, Phone, Instagram, Clock, ChevronRight,
  Sparkles, ShoppingBag, Calendar, ArrowRight, MessageSquare, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Navigation ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/95 backdrop-blur-md border-b border-black-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="AttractionzPro Hub Logo" className="w-12 h-12 rounded-full object-contain" />
          <div>
            <p className="font-display text-lg text-white leading-none">AttractionzPro</p>
            <p className="font-mono text-[10px] text-gold tracking-[0.3em] uppercase">Hub</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[['Services', '#services'], ['Gallery', '/gallery'], ['Shop', '/shop'], ['Contact', '#contact']].map(([label, href]) => (
            <Link key={label} href={href} className="text-gray-400 hover:text-gold transition-colors font-body text-sm tracking-wide">
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/book" className="btn-gold text-[11px] py-3 px-6">
            Book Now
          </Link>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
          <div className={`w-6 h-0.5 bg-current transition-all mb-1.5 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-current transition-all mb-1.5 ${open ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-current transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black-soft border-t border-black-border py-6 px-6 flex flex-col gap-4">
          {[['Services', '#services'], ['Gallery', '/gallery'], ['Shop', '/shop'], ['Contact', '#contact']].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setOpen(false)} className="text-gray-300 font-body text-base tracking-wide py-2 border-b border-black-border">
              {label}
            </Link>
          ))}
          <Link href="/book" className="btn-gold text-center mt-2">Book Appointment</Link>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black grid-luxury">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/8 blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-20">
        <span className="section-label animate-fade-in">Surulere, Lagos, Nigeria</span>

        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white leading-[0.9] mb-6 animate-slide-up">
          Where Beauty<br />
          <span className="text-gold-shimmer italic">Meets Luxury</span>
        </h1>

        <p className="font-script text-2xl md:text-3xl text-gold/80 mb-4">AttractionzPro Hub</p>

        <p className="font-body text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Premium nail care, bespoke nail art, custom designs, and exclusive perfume collections.
          Experience artistry redefined at Lagos' most luxurious beauty destination.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/book" className="btn-gold flex items-center gap-2 group">
            <Calendar className="w-4 h-4" />
            Book Appointment
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/shop" className="btn-outline-gold flex items-center gap-2 group">
            <ShoppingBag className="w-4 h-4" />
            Shop Perfumes
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 pt-12 border-t border-black-border">
          {[['500+', 'Happy Clients'], ['50+', 'Nail Designs'], ['20+', 'Luxury Perfumes']].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-3xl text-gold">{n}</p>
              <p className="font-mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="font-mono text-[9px] text-gray-600 tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/50 to-transparent" />
      </div>
    </section>
  );
}

// ── Services Section ─────────────────────────────────────────
const SERVICES_DATA = [
  { icon: '💅', title: 'Classic Manicure', desc: 'Shape, buff, and polish to perfection with premium products.' },
  { icon: '✨', title: 'Gel Manicure', desc: 'Long-lasting gel formula for a flawless chip-free finish.' },
  { icon: '🌸', title: 'Acrylic Extensions', desc: 'Custom length and shape crafted with precision.' },
  { icon: '🎨', title: 'Nail Art & Designs', desc: 'Bespoke artistry — from minimalist to elaborate statements.' },
  { icon: '🦶', title: 'Luxury Pedicure', desc: 'Full spa treatment for perfectly pampered feet.' },
  { icon: '🌹', title: 'Perfume Consultation', desc: 'Personalized fragrance curation from our premium collection.' },
];

function ServicesSection() {
  return (
    <section id="services" className="py-28 bg-black-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-label">What We Offer</span>
          <h2 className="font-display text-5xl md:text-6xl text-white">Our Services</h2>
          <div className="gold-divider" />
          <p className="font-body text-gray-500 max-w-xl mx-auto">
            Each service is crafted with artisanal precision, using only the finest products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black-border">
          {SERVICES_DATA.map((svc) => (
            <div key={svc.title} className="bg-black-soft p-8 group hover:bg-black-card transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-card-shine opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{svc.icon}</span>
                <h3 className="font-display text-2xl text-white mb-3 group-hover:text-gold transition-colors duration-300">{svc.title}</h3>
                <p className="font-body text-gray-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                <div className="w-0 group-hover:w-12 h-px bg-gold transition-all duration-500 mt-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/book" className="btn-gold">
            Book Your Service
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── About Section ────────────────────────────────────────────
function AboutSection() {
  return (
    <section className="py-28 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="section-label">Our Story</span>
            <h2 className="font-display text-5xl md:text-6xl text-white mb-6 leading-[1.1]">
              Crafting Beauty,<br />
              <span className="text-gold italic">One Detail at a Time</span>
            </h2>
            <div className="w-12 h-px bg-gold mb-8" />
            <p className="font-body text-gray-400 leading-relaxed mb-6">
              AttractionzPro Hub was born from a passion for excellence and a dedication to making every client feel
              like royalty. Nestled in the heart of Surulere, Lagos, we combine traditional Nigerian elegance with
              contemporary luxury beauty services.
            </p>
            <p className="font-body text-gray-400 leading-relaxed mb-10">
              From meticulous nail artistry to curated premium perfume collections, every experience at AttractionzPro
              is designed to leave you feeling extraordinary. Our skilled technicians treat each visit as a personal
              canvas, ensuring results that exceed your expectations.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <Clock className="w-5 h-5" />, label: 'Mon – Sat', value: '9:00 AM – 6:00 PM' },
                { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: 'Surulere, Lagos' },
                { icon: <Phone className="w-5 h-5" />, label: 'Call Us', value: '+234 802 320 8886' },
                { icon: <Star className="w-5 h-5" />, label: 'Rating', value: '5.0 ★ — Google' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-4 border border-black-border hover:border-gold/30 transition-colors">
                  <span className="text-gold mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-mono text-[10px] text-gray-600 tracking-widest uppercase">{item.label}</p>
                    <p className="font-body text-white text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square bg-black-card border border-black-border relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-script text-8xl text-gold/20">AttractionzPro</p>
                  <p className="font-mono text-xs text-gray-700 tracking-[0.5em] uppercase mt-4">Hub</p>
                </div>
              </div>
              {/* Decorative corners */}
              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                <div key={pos} className={`absolute ${pos} w-8 h-8 border-gold/40`}
                  style={{
                    borderWidth: pos.includes('top') && pos.includes('left') ? '2px 0 0 2px' :
                      pos.includes('top') ? '2px 2px 0 0' : pos.includes('left') ? '0 0 2px 2px' : '0 2px 2px 0'
                  }} />
              ))}
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-gold p-6">
              <p className="font-display text-4xl text-black font-bold leading-none">5★</p>
              <p className="font-mono text-[9px] text-black/70 tracking-widest uppercase mt-1">Rated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Reviews Section ──────────────────────────────────────────
function ReviewsSection() {
  const [reviews, setReviews] = useState<{ id: string; customer_name: string; rating: number; comment: string }[]>([]);
  const [form, setForm] = useState({ customer_name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/reviews?approved=true&limit=6')
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.data); })
      .catch(() => { });
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.comment) return toast.error('Please fill in all fields.');
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        toast.success('Thank you! Your review is pending approval.');
        setForm({ customer_name: '', rating: 5, comment: '' });
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const FALLBACK_REVIEWS = [
    { id: '1', customer_name: 'Amaka O.', rating: 5, comment: 'Absolutely stunning nail art! The attention to detail is unmatched. I get compliments everywhere I go.' },
    { id: '2', customer_name: 'Chisom N.', rating: 5, comment: 'Best nail salon in Lagos hands down. The perfume collection is divine — I bought three bottles!' },
    { id: '3', customer_name: 'Fatima A.', rating: 5, comment: 'The luxury experience here is real. Professional, elegant, and results that last for weeks.' },
  ];

  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section className="py-28 bg-black-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-label">Client Voices</span>
          <h2 className="font-display text-5xl md:text-6xl text-white">What They Say</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {displayReviews.map((rev) => (
            <div key={rev.id} className="luxury-card p-8 group">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-gold fill-gold' : 'text-gray-700'}`} />
                ))}
              </div>
              <p className="font-body text-gray-300 leading-relaxed mb-6 italic">"{rev.comment}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-black-border">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold font-display text-sm">{rev.customer_name[0]}</span>
                </div>
                <p className="font-body text-white text-sm font-medium">{rev.customer_name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Review submission */}
        <div className="max-w-2xl mx-auto border border-black-border p-8">
          <h3 className="font-display text-2xl text-white mb-2">Share Your Experience</h3>
          <p className="font-body text-gray-500 text-sm mb-6">Your review helps others discover our services.</p>
          <form onSubmit={submitReview} className="space-y-4">
            <input
              className="luxury-input"
              placeholder="Your name"
              value={form.customer_name}
              onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
            />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(p => ({ ...p, rating: n }))}>
                  <Star className={`w-6 h-6 transition-colors ${n <= form.rating ? 'text-gold fill-gold' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
            <textarea
              className="luxury-input resize-none"
              rows={4}
              placeholder="Tell us about your experience..."
              value={form.comment}
              onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
            />
            <button type="submit" disabled={submitting} className="btn-gold w-full flex items-center justify-center gap-2">
              {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Review</>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ── Feedback / Complaints Section ────────────────────────────
function FeedbackSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Customer Feedback', message: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent! We\'ll respond within 24 hours.');
        setForm({ name: '', email: '', subject: 'Customer Feedback', message: '' });
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-28 bg-black">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="section-label">We Listen</span>
          <h2 className="font-display text-5xl text-white">Feedback & Complaints</h2>
          <div className="gold-divider" />
          <p className="font-body text-gray-500">Your satisfaction is our priority. Share any concerns or suggestions.</p>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-black-border p-8">
          <div className="grid grid-cols-2 gap-4">
            <input className="luxury-input" placeholder="Your name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <input className="luxury-input" type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <select className="luxury-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
            <option>Customer Feedback</option>
            <option>Complaint</option>
            <option>General Inquiry</option>
            <option>Suggestion</option>
          </select>
          <textarea className="luxury-input resize-none" rows={5} placeholder="Your message *" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}

// Map Section
function MapSection() {
  return (
    <section className="py-0">
      <div className="border-t border-b border-black-border">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="section-label">Find Us</span>
            <h3 className="font-display text-4xl text-white">Visit Our Studio</h3>
            <p className="font-body text-gray-500 mt-2">2-14 James Robertson Rd, Surulere, Lagos 101241</p>
            <a href="tel:+2348023208886" className="flex items-center gap-2 text-gold font-body text-sm mt-3 hover:underline">
              <Phone className="w-4 h-4" /> +234 802 320 8886
            </a>
          </div>

          href="https://maps.google.com/?q=2-14+James+Robertson+Rd+Surulere+Lagos"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-gold flex items-center gap-2"
          >
          <MapPin className="w-4 h-4" /> Get Directions
        </a>
      </div>
      <div className="w-full h-72 bg-black-card relative overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.4!2d3.3582!3d6.4969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjknNDguOCJOIDPCsDIxJzI5LjUiRQ!5e0!3m2!1sen!2sng!4v1"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.5)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="AttractionzPro Hub Location"
        />
      </div>
    </div>
    </section >
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-black-soft border-t border-black-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-script text-4xl text-gold mb-2">AttractionzPro</p>
            <p className="font-mono text-xs text-gray-600 tracking-[0.4em] uppercase mb-4">Hub</p>
            <p className="font-body text-gray-500 text-sm leading-relaxed">
              Luxury nail care & premium perfumes in the heart of Surulere, Lagos.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-gold tracking-widest uppercase mb-4">Quick Links</p>
            <div className="flex flex-col gap-2">
              {[['Book Appointment', '/book'], ['Shop Perfumes', '/shop'], ['Gallery', '/gallery'], ['Contact Us', '/contact']].map(([l, h]) => (
                <Link key={l} href={h} className="font-body text-gray-500 text-sm hover:text-gold transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] text-gold tracking-widest uppercase mb-4">Contact</p>
            <div className="space-y-3">
              <p className="font-body text-gray-500 text-sm flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                2-14 James Robertson Rd, Surulere, Lagos
              </p>
              <p className="font-body text-gray-500 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold" />
                +234 802 320 8886
              </p>
              <div className="flex gap-3 pt-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 border border-black-border flex items-center justify-center hover:border-gold hover:text-gold transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348023208886'}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 border border-black-border flex items-center justify-center hover:border-gold hover:text-gold transition-all text-xs font-bold">
                  WA
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-black-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-gray-700">© {new Date().getFullYear()} AttractionzPro Hub. All rights reserved.</p>
          <p className="font-mono text-xs text-gray-700">Crafted with ♥ in Lagos</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page Export ───────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <ReviewsSection />
      <FeedbackSection />
      <MapSection />
      <Footer />
    </main>
  );
}