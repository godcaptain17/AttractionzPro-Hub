# AttractionzPro Hub — Full-Stack Deployment Playbook

## Stack Overview
- **Frontend + Backend**: Next.js 14 App Router (TypeScript)
- **Database + Auth + Storage**: Supabase
- **Emails**: Resend
- **Deployment**: Vercel
- **Styling**: Tailwind CSS (Luxury Black/Gold theme)

---

## STEP 1 — Local Development Setup

### Prerequisites
- Node.js 18.17+ (check: `node -v`)
- npm 9+ or pnpm 8+
- A Supabase account (supabase.com)
- A Resend account (resend.com)
- A Vercel account (vercel.com)

### Install dependencies
```bash
cd attractionzpro-hub
npm install
```

### Set up environment variables
```bash
cp .env.local.example .env.local
# Then open .env.local and fill in every value (see Step 2)
```

---

## STEP 2 — Supabase Setup

### 2a. Create a new Supabase project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Choose your organisation, name the project `attractionzpro-hub`
4. Set a strong database password — save it!
5. Select **West Africa** or **Europe (eu-west-2)** region for lowest latency from Lagos
6. Click **Create new project** and wait ~2 minutes

### 2b. Run the SQL migration
1. In your Supabase dashboard, go to **SQL Editor** → **New Query**
2. Paste the **entire contents** of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** (green button)
4. Verify success — you should see all tables in the **Table Editor**

### 2c. Seed the admin account
In the same SQL Editor, run:
```sql
SELECT seed_admin('your-admin@email.com', 'YourSuperSecurePassword!');
```
Replace with your actual admin email and a strong password.

### 2d. Create Storage Buckets
The migration SQL auto-creates them, but verify:
1. Go to **Storage** in your dashboard
2. Confirm `product-images` and `gallery-images` buckets exist
3. Both should be marked **Public**

### 2e. Get your API keys
Go to **Settings → API**:
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon (public) key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role (secret) key** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

---

## STEP 3 — Resend Setup (Email)

1. Go to https://resend.com → Sign up / Log in
2. Go to **API Keys** → **Create API Key**
3. Name it `AttractionzPro Production`, set permission to **Full access**
4. Copy the key → `RESEND_API_KEY`
5. Go to **Domains** → **Add Domain**
   - Add your domain (e.g. `attractionzprohub.com`)
   - Add the DNS records it provides to your domain registrar
   - Wait for verification (5–30 minutes)
6. Set `RESEND_FROM_EMAIL` to `notifications@attractionzprohub.com`

> If you don't have a domain yet, use `onboarding@resend.dev` for testing (limited to 1 recipient).

---

## STEP 4 — Fill in .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

JWT_SECRET=<run: openssl rand -base64 64>

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=notifications@attractionzprohub.com
ADMIN_EMAIL=admin@attractionzprohub.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BUSINESS_NAME=AttractionzPro Hub
NEXT_PUBLIC_BUSINESS_PHONE=+2348023208886
NEXT_PUBLIC_BUSINESS_ADDRESS=2-14 James Robertson Rd, Surulere, Lagos 101241
NEXT_PUBLIC_WHATSAPP_NUMBER=2348023208886

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

Generate JWT_SECRET:
```bash
openssl rand -base64 64
```

---

## STEP 5 — Run Locally

```bash
npm run dev
# App runs at http://localhost:3000
# Admin panel at http://localhost:3000/admin/login
```

Type-check:
```bash
npm run type-check
```

Lint:
```bash
npm run lint
```

---

## STEP 6 — Deploy to Vercel

### 6a. Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial AttractionzPro Hub production build"
git remote add origin https://github.com/yourusername/attractionzpro-hub.git
git push -u origin main
```

### 6b. Import to Vercel
1. Go to https://vercel.com/new
2. Click **Import** next to your GitHub repo
3. Set **Framework Preset** to **Next.js** (auto-detected)
4. Leave **Root Directory** as `.`
5. Click **Environment Variables** and add **all** variables from `.env.local`
   - Change `NEXT_PUBLIC_SITE_URL` to your actual production URL
   - e.g., `https://www.attractionzprohub.com`
6. Click **Deploy**

### 6c. Configure custom domain (optional)
1. In Vercel → your project → **Settings → Domains**
2. Add `attractionzprohub.com` and `www.attractionzprohub.com`
3. Update your DNS registrar with the CNAME records Vercel provides

---

## STEP 7 — Post-Deployment Checklist

### Supabase production settings
- [ ] In Supabase → **Settings → Auth**, add your production URL to **Allowed Redirect URLs**
- [ ] In Supabase → **Settings → API**, add your Vercel URL to **Allowed Origins** (CORS)
- [ ] Verify all RLS policies are active (Table Editor → each table → RLS)

### Test all critical flows
- [ ] Homepage loads (/, /shop, /gallery, /book, /contact)
- [ ] Book an appointment → receives "Pending" entry in Supabase `appointments` table
- [ ] Admin login at `/admin/login`
- [ ] Admin can approve appointment → customer receives email
- [ ] Add a product in Admin → appears in `/shop`
- [ ] Add to cart → checkout → WhatsApp opens with correct message
- [ ] Submit contact message → appears in admin Messages tab
- [ ] Upload gallery image → appears in `/gallery`
- [ ] Submit a review → appears in admin Reviews tab → approve → shows on homepage

### Performance
```bash
# Run lighthouse audit
npx lighthouse https://www.attractionzprohub.com --view
```

---

## STEP 8 — Supabase Storage CORS (if image uploads fail)

1. Supabase dashboard → **Storage** → **Policies**
2. For `product-images` and `gallery-images` buckets:
   - Ensure the **SELECT** policy allows public access
   - Ensure the **INSERT** policy requires `service_role`

If admin uploads fail from the browser, add this to the bucket policy:
```sql
CREATE POLICY "Authenticated admin upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('product-images', 'gallery-images')
  AND auth.role() = 'authenticated'
);
```

Or use a signed upload URL approach via the service role client in the API route.

---

## STEP 9 — Security Hardening

1. **Rotate JWT_SECRET** every 90 days: update Vercel env var → redeploy
2. **Admin password**: change the seeded password via SQL:
   ```sql
   UPDATE admins SET password_hash = crypt('NewPassword!', gen_salt('bf', 12)) WHERE email = 'your@email.com';
   ```
3. **Rate limiting**: Consider adding Vercel Edge Config or Upstash Redis for API rate limits on `/api/appointments` and `/api/checkout`
4. **Headers**: `next.config.js` already includes security headers
5. **Supabase**: Enable **Database Webhooks** for real-time admin alerts
6. Enable **Point-in-Time Recovery** in Supabase for production database backup

---

## Project File Structure

```
attractionzpro-hub/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts          ← Admin JWT login/logout
│   │   ├── appointments/route.ts        ← Book + list appointments
│   │   ├── appointments/[id]/route.ts   ← Update appointment status
│   │   ├── checkout/route.ts            ← Order processing + WhatsApp
│   │   ├── messages/route.ts            ← Contact form + admin replies
│   │   ├── gallery/route.ts             ← Gallery CRUD
│   │   ├── products/route.ts            ← Product CRUD
│   │   ├── orders/route.ts              ← Orders listing
│   │   ├── orders/[id]/route.ts         ← Order status update
│   │   └── reviews/route.ts             ← Reviews + moderation
│   ├── admin/
│   │   ├── layout.tsx                   ← Sidebar navigation
│   │   ├── login/page.tsx               ← Secure admin login
│   │   ├── dashboard/page.tsx           ← Stats + charts + alerts
│   │   ├── appointments/page.tsx        ← Calendar + approval system
│   │   ├── products/page.tsx            ← Product CRUD + image upload
│   │   ├── orders/page.tsx              ← Order management
│   │   ├── messages/page.tsx            ← Message center + reply
│   │   ├── gallery/page.tsx             ← Gallery management
│   │   └── reviews/page.tsx             ← Review moderation
│   ├── book/page.tsx                    ← Multi-step booking form
│   ├── shop/page.tsx                    ← E-commerce + cart + checkout
│   ├── gallery/page.tsx                 ← Before/after slider gallery
│   ├── contact/page.tsx                 ← Contact form
│   ├── page.tsx                         ← Homepage
│   ├── layout.tsx                       ← Root layout + fonts
│   └── globals.css                      ← Tailwind + custom styles
├── lib/
│   ├── supabase.ts                      ← Browser + server + admin clients
│   ├── auth.ts                          ← JWT sign/verify utilities
│   ├── email.ts                         ← Resend email templates
│   └── utils.ts                         ← Formatters + constants
├── types/
│   └── index.ts                         ← All TypeScript interfaces
├── supabase/migrations/
│   └── 001_initial_schema.sql           ← Full database schema
├── middleware.ts                        ← Admin route protection
├── tailwind.config.js                   ← Luxury gold/black theme
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## Support & Maintenance

- **Supabase logs**: Dashboard → Logs → API/Database
- **Vercel logs**: Dashboard → your project → Functions
- **Email logs**: Resend dashboard → Emails

For Nigerian-specific optimizations:
- Consider **Cloudflare** as CDN in front of Vercel for better Lagos latency
- Use **Paystack** or **Flutterwave** for future inline payment integration (instead of WhatsApp-only checkout)
- **MTN/Airtel** SMS via Termii for appointment reminders as alternative to email
