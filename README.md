# Homio Ghana — Setup Guide

A real property listing platform built with Next.js + Supabase.

## What's included

- Public homepage with featured/recent listings (live from database)
- Listings page with filters (type, region, category, beds, price, furnished) via URL params
- Property detail page with enquiry form
- Agent sign up / login (Supabase Auth)
- Admin dashboard — agents manage only their own listings (add / edit / delete)
- Row Level Security already enforced at the database level

## 1. Install dependencies

```bash
cd homio
npm install
```

## 2. Set up Supabase

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `homio-supabase-schema.sql` (provided separately) to create all tables
3. Go to **Project Settings → API** and copy:
   - Project URL
   - anon public key

## 3. Add environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and paste in your real Supabase URL and anon key.

## 4. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

## 5. Create your first agent account

Go to `/login` → click "Create an account" → sign up. This creates both:
- A Supabase Auth user
- A matching row in the `agents` table (company name, phone, etc.)

You'll be redirected to `/admin` where you can add your first property.

## 6. Deploy to Vercel

1. Push this project to a GitHub repository
2. Go to https://vercel.com → New Project → import your repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

## 7. Connect your domain

In Vercel → Project Settings → Domains → add your domain (e.g. `homio.com.gh`) and follow the DNS instructions shown (usually adding an A record or CNAME at your domain registrar).

## Project structure

```
homio/
├── app/
│   ├── page.js              → Homepage
│   ├── listings/page.js     → Browse/filter listings
│   ├── property/[id]/page.js → Single property detail
│   ├── login/page.js        → Agent sign in / sign up
│   ├── admin/page.js        → Protected dashboard
│   └── layout.js            → Root layout + navbar
├── components/
│   ├── Navbar.js
│   ├── PropertyCard.js
│   ├── FilterSidebar.js
│   ├── SearchWidget.js
│   ├── EnquiryForm.js
│   └── AdminManager.js
├── lib/
│   ├── supabase-client.js   → Browser Supabase client
│   ├── supabase-server.js   → Server Supabase client
│   └── constants.js         → Design tokens, regions, helpers
└── middleware.js            → Keeps auth session in sync
```

## Next steps / ideas

- Add multiple photo uploads per listing (Supabase Storage)
- Add a real map (Leaflet or Google Maps) using `latitude`/`longitude` columns already in the schema
- Add a "favourites" page using the `favourites` table already in the schema
- Add pagination once listings grow beyond ~50
- Add a currency toggle (GH₵ / USD)
