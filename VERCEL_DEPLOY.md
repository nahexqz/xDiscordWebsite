# Vercel Deployment Guide

## Setup Steps

### 1. Import project to Vercel
- Connect your GitHub repo
- Vercel auto-detects Next.js from `rootDirectory: "apps/web"` in `vercel.json`

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

## Bug Fixes Applied
1. `app/page.tsx` — Fixed `window.innerHeight` SSR crash in `Particles` component
2. `next.config.ts` — Removed `output: "standalone"` (incompatible with Vercel)
3. `lib/stripe.ts` — Updated Stripe API version to `2025-04-30.basil`
4. All dynamic API routes — Updated `params` to `Promise<{id: string}>` (Next.js 15)
5. `app/api/stripe/webhook/route.ts` — Removed invalid `config` export for App Router
6. `vercel.json` — Switched to `rootDirectory` pattern (correct for monorepo)
7. All packages updated to latest versions
