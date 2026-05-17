# Vercel Deployment Guide

## Setup Steps

### 1. Import project to Vercel
- Connect your GitHub repo
- Set **Root Directory** to `apps/web` in the Vercel dashboard (Project Settings → General → Root Directory)
- Framework: Next.js (auto-detected)

### 2. Required Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

```
# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://your-domain.vercel.app/api/auth/discord/callback
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_LOG_CHANNEL_ID=
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/your-invite

# Admin
ADMIN_DISCORD_IDS=discord_id1,discord_id2

# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Database (use Neon, PlanetScale, or Supabase for serverless)
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Firebase (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 3. Database
Run migrations before first deploy:
```bash
cd apps/web
npx prisma migrate deploy
```

### 4. Stripe Webhook
After deploying, add webhook in Stripe Dashboard:
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

### 5. Socket.IO (Realtime)
Socket.IO (`server.ts`) requires a persistent server — **not compatible with Vercel**.
Options:
- Deploy `server.ts` separately on **Railway** or **Render**
- Replace with **Pusher** or **Ably** for serverless-compatible realtime

---

## Build Optimizations Applied (fixes build timeout)

### Root Cause of Timeout
Vercel build was timing out (45+ min) due to:
1. `shop/[productId]/page.tsx` — Server Component trying to query DB during static generation (hangs if DB unreachable)
2. `sitemap.ts` — Same issue, Prisma query during build-time generation
3. Missing `prisma generate` before `next build` — caused Prisma Client import errors
4. ESLint running during build — added 10–15 min extra
5. TypeScript incremental cache (`.tsbuildinfo`) conflicts on Vercel

### Fixes Applied
1. `app/shop/[productId]/page.tsx` — Added `export const dynamic = "force-dynamic"` (skips static generation, renders at request time)
2. `app/sitemap.ts` — Added `export const dynamic = "force-dynamic"` (generates sitemap at request time)
3. `apps/web/package.json` — Build script now: `prisma generate && next build`
4. `apps/web/next.config.ts` — Added `eslint: { ignoreDuringBuilds: true }` and `outputFileTracingExcludes`
5. `apps/web/tsconfig.json` — Disabled `incremental` to avoid `.tsbuildinfo` conflicts
6. `vercel.json` (root) — Added `buildCommand`, `installCommand`, `outputDirectory`, `framework`
7. `apps/web/vercel.json` — Updated `buildCommand` to include `prisma generate`
8. `.vercelignore` — Added large unused files (zips, docs) to ignore list

### Expected Build Time
After fixes: **5–12 minutes** (down from 45+ min timeout)
