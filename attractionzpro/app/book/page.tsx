'use client';
// app/book/page.tsx — Multi-step Appointment Booking
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { SERVICES, TIME_SLOTS, formatDate } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  customer_name:    string;
  email:            string;
  phone:            string;
  service:          string;
  appointment_date: string;
  appointment_time: string;
  note:             string;
}

const INITIAL: FormData = {
  customer_name: '', email: '', phone: '', service: '',
  appointment_date: '', appointment_time: '', note: '',
};

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: 'Personal Info' },
    { n: 2, label: 'Service' },
    { n: 3, label: 'Date & Time' },
    { n: 4, label: 'Confirm' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs transition-all duration-500 ${
              step > s.n ? 'bg-gold text-black' : step === s.n ? 'bg-gold/20 border-2 border-gold text-gold' : 'bg-black-card border border-black-border text-gray-600'
            }`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`font-mono text-[10px] mt-2 tracking-widest uppercase ${step >= s.n ? 'text-gold' : 'text-gray-700'}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-px mt-[-12px] transition-all duration-500 ${step > s.n ? 'bg-gold' : 'bg-black-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function BookPage() {
  const [step, setStep]       = useState<Step>(1);
  const [form, setForm]       = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: keyof FormData, val: string) => setForm(p => ({ ...p, [field]: val }));

  const next = () => {
    if (step === 1 && (!form.customer_name || !form.email || !form.phone)) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (step === 2 && !form.service) { toast.error('Please select a service.'); return; }
    if (step === 3 && (!form.appointment_date || !form.appointment_time)) {
      toast.error('Please select a date and time.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4) as Step);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        toast.error(data.error || 'Booking failed.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mx-auto mb-8 animate-pulse-gold">
            <CheckCircle className="w-10 h-10 text-gold" />
          </div>
          <h2 className="font-display text-5xl text-white mb-4">Booking Received!</h2>
          <p className="font-body text-gray-400 leading-relaxed mb-2">
            Thank you, <strong className="text-white">{form.customer_name}</strong>. Your appointment request for{' '}
            <strong className="text-gold">{form.service}</strong> on{' '}
            <strong className="text-white">{formatDate(form.appointment_date)}</strong> at{' '}
            <strong className="text-white">{form.appointment_time}</strong> has been received.
          </p>
          <p className="font-body text-gray-500 text-sm mb-10">
            We'll send a confirmation to <strong className="text-gold">{form.email}</strong> once your booking is approved.
          </p>
          <Link href="/" className="btn-gold">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black grid-luxury">
      {/* Header */}
      <div className="border-b border-black-border bg-black-soft">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gold transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-mono text-[10px] text-gold tracking-widest uppercase">AttractionzPro Hub</span>
            </div>
            <h1 className="font-display text-3xl text-white">Book an Appointment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <StepIndicator step={step} />

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <span className="section-label">Step 1 of 4</span>
              <h2 className="font-display text-4xl text-white flex items-center justify-center gap-3">
                <User className="w-8 h-8 text-gold" /> Your Details
              </h2>
            </div>
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Full Name *</label>
              <input className="luxury-input" placeholder="Enter your full name" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Email Address *</label>
              <input className="luxury-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Phone Number *</label>
              <input className="luxury-input" type="tel" placeholder="+234 XXX XXX XXXX" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <span className="section-label">Step 2 of 4</span>
              <h2 className="font-display text-4xl text-white">Choose Your Service</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((svc) => (
                <button
                  key={svc}
                  onClick={() => update('service', svc)}
                  className={`p-4 border text-left transition-all duration-300 ${
                    form.service === svc
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-black-border text-gray-400 hover:border-gold/50 hover:text-white'
                  }`}
                >
                  <span className="font-body text-sm">{svc}</span>
                  {form.service === svc && <span className="ml-2 text-gold">✓</span>}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Additional Notes (optional)</label>
              <textarea
                className="luxury-input resize-none"
                rows={3}
                placeholder="Any special requests, reference images, or preferences..."
                value={form.note}
                onChange={e => update('note', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <span className="section-label">Step 3 of 4</span>
              <h2 className="font-display text-4xl text-white flex items-center justify-center gap-3">
                <Calendar className="w-8 h-8 text-gold" /> Date & Time
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-2">Preferred Date *</label>
                <input
                  className="luxury-input"
                  type="date"
                  min={today}
                  value={form.appointment_date}
                  onChange={e => update('appointment_date', e.target.value)}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase block mb-3">Preferred Time *</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => update('appointment_time', slot)}
                      className={`py-3 text-center font-mono text-xs transition-all border ${
                        form.appointment_time === slot
                          ? 'border-gold bg-gold text-black font-bold'
                          : 'border-black-border text-gray-500 hover:border-gold/50 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-black-card border border-gold/20">
                <p className="font-mono text-[10px] text-gold tracking-widest uppercase mb-1">Business Hours</p>
                <p className="font-body text-gray-400 text-sm">Monday – Saturday: 9:00 AM – 6:00 PM</p>
                <p className="font-body text-gray-500 text-xs mt-1">Sundays by special appointment only.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <span className="section-label">Step 4 of 4</span>
              <h2 className="font-display text-4xl text-white">Confirm Booking</h2>
            </div>
            <div className="border border-black-border">
              {[
                ['Name',    form.customer_name],
                ['Email',   form.email],
                ['Phone',   form.phone],
                ['Service', form.service],
                ['Date',    form.appointment_date ? formatDate(form.appointment_date) : ''],
                ['Time',    form.appointment_time],
                ...(form.note ? [['Notes', form.note] as [string, string]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-4 p-4 border-b border-black-border last:border-0">
                  <span className="font-mono text-[10px] text-gray-600 tracking-widest uppercase w-20 flex-shrink-0 mt-1">{label}</span>
                  <span className="font-body text-white text-sm">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gold/5 border border-gold/20">
              <p className="font-body text-gray-400 text-sm">
                📧 A confirmation will be sent to <strong className="text-white">{form.email}</strong> once your appointment is approved. You may receive a call for verification.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep((p) => Math.max(p - 1, 1) as Step)}
            disabled={step === 1}
            className="btn-outline-gold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < 4 ? (
            <button onClick={next} className="btn-gold flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-gold flex items-center gap-2">
              {loading ? 'Booking...' : <><CheckCircle className="w-4 h-4" /> Confirm Booking</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
