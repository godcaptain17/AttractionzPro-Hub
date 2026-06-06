// app/layout.tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost, Dancing_Script, Space_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display:  'swap',
});

const jost = Jost({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-jost',
  display:  'swap',
});

const dancing = Dancing_Script({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-dancing',
  display:  'swap',
});

const spaceMono = Space_Mono({
  subsets:  ['latin'],
  weight:   ['400', '700'],
  variable: '--font-space-mono',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'AttractionzPro Hub — Luxury Nail Care & Premium Perfumes | Surulere, Lagos',
  description: 'Experience luxury nail care, bespoke nail art, custom designs, and premium perfume sales at AttractionzPro Hub in Surulere, Lagos. Book your appointment today.',
  keywords:    ['nail salon Lagos', 'luxury nails Surulere', 'nail art Lagos', 'premium perfume Lagos', 'AttractionzPro Hub'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://attractionzprohub.com'),
  openGraph: {
    title:       'AttractionzPro Hub — Luxury Nail Care & Premium Perfumes',
    description: 'Bespoke nail art, luxury nail care & premium perfumes in Surulere, Lagos.',
    type:        'website',
    locale:      'en_NG',
    siteName:    'AttractionzPro Hub',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'AttractionzPro Hub',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${dancing.variable} ${spaceMono.variable}`}>
      <body className="bg-black text-white font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background:   '#1a1a1a',
              color:        '#ffffff',
              border:       '1px solid #D4AF37',
              borderRadius: '8px',
              fontFamily:   'var(--font-jost)',
            },
            success: { iconTheme: { primary: '#D4AF37', secondary: '#0a0a0a' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' } },
          }}
        />
      </body>
    </html>
  );
}
