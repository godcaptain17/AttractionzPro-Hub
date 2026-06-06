-- ============================================================
-- AttractionzPro Hub — Complete Supabase Schema Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only authenticated service_role can read/write admins
CREATE POLICY "Service role only" ON public.admins
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TYPE appointment_status AS ENUM ('Pending','Approved','Rejected','Completed');

CREATE TABLE IF NOT EXISTS public.appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name    TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  service          TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  note             TEXT,
  status           appointment_status NOT NULL DEFAULT 'Pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (book an appointment)
CREATE POLICY "Public can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Service role can read & update
CREATE POLICY "Service role full access appointments" ON public.appointments
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category     TEXT NOT NULL DEFAULT 'Uncategorized',
  image_urls   TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read available products
CREATE POLICY "Public can view available products" ON public.products
  FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Service role full access products" ON public.products
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TYPE order_status AS ENUM ('Pending','Processing','Delivered','Cancelled');

CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name   TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  address         TEXT NOT NULL,
  total_amount    NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  status          order_status NOT NULL DEFAULT 'Pending',
  whatsapp_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  promo_code      TEXT,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access orders" ON public.orders
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access order_items" ON public.order_items
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TYPE message_status AS ENUM ('Read','Unread');

CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      message_status NOT NULL DEFAULT 'Unread',
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert messages" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access messages" ON public.messages
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: gallery
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  before_image_url TEXT,
  after_image_url  TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'Nail Art',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery" ON public.gallery
  FOR SELECT USING (true);

CREATE POLICY "Service role full access gallery" ON public.gallery
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Public can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access reviews" ON public.reviews
  USING (auth.role() = 'service_role');

-- ============================================================
-- TABLE: promo_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code             TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  expiry_date      DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access promo_codes" ON public.promo_codes
  USING (auth.role() = 'service_role');

-- Public can only validate (read) promo codes
CREATE POLICY "Public can validate promo codes" ON public.promo_codes
  FOR SELECT USING (active = TRUE AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these after creating the schema
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('gallery-images', 'gallery-images', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Service role upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'service_role');

CREATE POLICY "Public read gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Service role upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND auth.role() = 'service_role');

-- ============================================================
-- FUNCTION: Seed Initial Admin (uses env variables approach)
-- Call this function once with your admin credentials:
-- SELECT seed_admin('admin@attractionzprohub.com', 'YourSecurePassword123!');
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_admin(
  p_email    TEXT,
  p_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admins (email, password_hash)
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf', 12))
  )
  ON CONFLICT (email) DO NOTHING;
END;
$$;

-- ============================================================
-- FUNCTION: Validate Admin Login
-- Returns TRUE if email+password match a record in admins
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_admin(
  p_email    TEXT,
  p_password TEXT
)
RETURNS TABLE(id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email
  FROM public.admins a
  WHERE a.email = p_email
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$;

-- ============================================================
-- FUNCTION: Decrement stock on order
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id UUID,
  p_quantity   INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - p_quantity,
      is_available = CASE WHEN (stock - p_quantity) <= 0 THEN FALSE ELSE TRUE END
  WHERE id = p_product_id AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date   ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category    ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_messages_status      ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_reviews_approved     ON public.reviews(is_approved);

-- ============================================================
-- SAMPLE PROMO CODES
-- ============================================================
INSERT INTO public.promo_codes (code, discount_percent, active, expiry_date)
VALUES
  ('WELCOME10', 10, TRUE, '2025-12-31'),
  ('VIP20',     20, TRUE, '2025-09-30'),
  ('LUXE15',    15, TRUE, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE — Now call: SELECT seed_admin('your@email.com', 'password');
-- ============================================================
