// ============================================================
// lib/utils.ts — Shared utility functions
// ============================================================
import { clsx, type ClassValue } from 'clsx';
import { twMerge }               from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h    = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function generateWhatsAppText(params: {
  orderId:      string;
  customerName: string;
  phone:        string;
  address:      string;
  items:        { name: string; quantity: number; price: number }[];
  total:        number;
  discount:     number;
  promoCode?:   string;
}): string {
  const itemLines = params.items
    .map(i => `  • ${i.name} x${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`)
    .join('\n');

  const discountLine = params.discount > 0
    ? `\n🏷️ Discount (${params.promoCode}): -₦${params.discount.toLocaleString()}`
    : '';

  return `🌟 *New Order — AttractionzPro Hub*
━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${params.orderId.slice(0, 8).toUpperCase()}
👤 *Customer:* ${params.customerName}
📞 *Phone:* ${params.phone}
📍 *Delivery Address:*
${params.address}

🛍️ *Items Ordered:*
${itemLines}${discountLine}
━━━━━━━━━━━━━━━━━━━━
💰 *Total: ₦${params.total.toLocaleString()}*

💳 *Payment Options:*
  • Cash on Delivery
  • POS/Card at Pickup
  • Bank Transfer (details will be provided)

Please confirm this order and provide estimated delivery time. Thank you! 🙏`;
}

export const SERVICES = [
  'Classic Manicure',
  'Gel Manicure',
  'Acrylic Nail Extensions',
  'Nail Art & Custom Designs',
  'Pedicure (Classic)',
  'Pedicure (Spa)',
  'Gel Pedicure',
  'Nail Removal & Soak Off',
  'Nail Repair',
  'Premium Perfume Consultation',
  'Other / Custom Request',
] as const;

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
] as const;

export const PRODUCT_CATEGORIES = [
  'All',
  'Eau de Parfum',
  'Eau de Toilette',
  'Body Mist',
  'Oil Perfume',
  'Gift Sets',
  'Nail Products',
] as const;

export const GALLERY_CATEGORIES = [
  'All',
  'Nail Art',
  'Gel Nails',
  'Acrylics',
  'Nail Designs',
  'Salon Interior',
] as const;
