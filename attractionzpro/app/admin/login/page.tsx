'use client';
// app/admin/login/page.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Welcome back!');
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black grid-luxury flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30 mx-auto mb-4">
            <img src="/logo.jpg" alt="AttractionzPro Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-4xl text-white">Admin Portal</h1>
          <p className="font-mono text-[10px] text-gray-600 tracking-[0.3em] uppercase mt-1">AttractionzPro Hub</p>
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        <form onSubmit={submit} className="border border-black-border bg-black-soft p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-900/40 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-body">{error}</span>
            </div>
          )}

          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Email Address</label>
            <input
              className="luxury-input"
              type="email"
              placeholder="admin@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Password</label>
            <div className="relative">
              <input
                className="luxury-input pr-12"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="text-center font-mono text-[10px] text-gray-700 mt-6 tracking-widest uppercase">
          Secure Admin Access Only
        </p>
      </div>
    </div>
  );
}