// ============================================================
// AttractionzPro Hub — Shared TypeScript Types
// ============================================================

export type AppointmentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';
export type OrderStatus        = 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
export type MessageStatus      = 'Read' | 'Unread';

// ── Database Row Types ──────────────────────────────────────

export interface Admin {
  id:            string;
  email:         string;
  password_hash: string;
  created_at:    string;
}

export interface Appointment {
  id:               string;
  customer_name:    string;
  email:            string;
  phone:            string;
  service:          string;
  appointment_date: string;
  appointment_time: string;
  note?:            string;
  status:           AppointmentStatus;
  created_at:       string;
}

export interface Product {
  id:           string;
  name:         string;
  description:  string;
  price:        number;
  stock:        number;
  category:     string;
  image_urls:   string[];
  is_available: boolean;
  created_at:   string;
}

export interface Order {
  id:              string;
  customer_name:   string;
  email:           string;
  phone:           string;
  address:         string;
  total_amount:    number;
  status:          OrderStatus;
  whatsapp_sent:   boolean;
  promo_code?:     string;
  discount_amount: number;
  created_at:      string;
  order_items?:    OrderItem[];
}

export interface OrderItem {
  id:         string;
  order_id:   string;
  product_id: string;
  quantity:   number;
  price:      number;
  product?:   Product;
}

export interface Message {
  id:          string;
  name:        string;
  email:       string;
  phone?:      string;
  subject:     string;
  message:     string;
  status:      MessageStatus;
  admin_reply: string | null;
  created_at:  string;
}

export interface GalleryItem {
  id:               string;
  title:            string;
  before_image_url: string | null;
  after_image_url:  string;
  category:         string;
  created_at:       string;
}

export interface Review {
  id:            string;
  customer_name: string;
  rating:        number;
  comment:       string;
  is_approved:   boolean;
  created_at:    string;
}

export interface PromoCode {
  id:               string;
  code:             string;
  discount_percent: number;
  active:           boolean;
  expiry_date:      string | null;
  created_at:       string;
}

// ── Cart Types ──────────────────────────────────────────────

export interface CartItem {
  product:  Product;
  quantity: number;
}

// ── API Response Types ──────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data:    T;
  message?: string;
}

export interface ApiError {
  success: false;
  error:   string;
  code?:   string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ── Dashboard Stats ─────────────────────────────────────────

export interface DashboardStats {
  totalAppointments:    number;
  pendingAppointments:  number;
  totalOrders:          number;
  totalRevenue:         number;
  lowStockProducts:     Product[];
  recentOrders:         Order[];
  monthlyRevenue:       { month: string; revenue: number }[];
}

// ── Booking Form ────────────────────────────────────────────

export interface BookingFormData {
  customer_name:    string;
  email:            string;
  phone:            string;
  service:          string;
  appointment_date: string;
  appointment_time: string;
  note:             string;
}

// ── Checkout Form ───────────────────────────────────────────

export interface CheckoutFormData {
  customer_name: string;
  email:         string;
  phone:         string;
  address:       string;
  promo_code:    string;
}

// ── Admin JWT Payload ────────────────────────────────────────

export interface AdminJWTPayload {
  sub:   string;
  email: string;
  iat:   number;
  exp:   number;
}
