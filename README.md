# 🎮 Legendary Community — Full Stack Discord Platform

A production-ready Discord Community Platform with role shop, verification system, ticket support, admin dashboard, and Discord bot automation.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Framer Motion, Shadcn/ui |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | Discord OAuth2 + JWT + HttpOnly Cookies |
| Payments | Stripe (THB currency) |
| Realtime | Socket.io |
| Discord Bot | discord.js v14 |
| OTP | Firebase Phone Auth |
| File Upload | Cloudinary |
| Deployment | Docker, Vercel, Railway |

---

## 📁 Project Structure

```
legendary-community/
├── apps/
│   ├── web/                    # Next.js 15 Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   ├── (main)/
│   │   │   │   ├── page.tsx              # Homepage
│   │   │   │   ├── shop/
│   │   │   │   ├── verification/
│   │   │   │   ├── tickets/
│   │   │   │   ├── profile/
│   │   │   │   ├── success/
│   │   │   │   ├── cancel/
│   │   │   │   ├── terms/
│   │   │   │   └── privacy/
│   │   │   ├── dashboard/
│   │   │   │   └── admin/
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── stripe/
│   │   │       ├── verification/
│   │   │       ├── tickets/
│   │   │       ├── admin/
│   │   │       └── wallet/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── types/
│   └── bot/                    # Discord Bot
│       ├── src/
│       │   ├── commands/
│       │   ├── events/
│       │   ├── handlers/
│       │   └── index.ts
│       └── package.json
├── packages/
│   └── prisma/                 # Shared Prisma schema
│       ├── schema.prisma
│       └── migrations/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Installation Guide

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)
- Discord Developer App
- Stripe Account
- Firebase Project
- Cloudinary Account

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/legendary-community.git
cd legendary-community

# Install web dependencies
cd apps/web
npm install

# Install bot dependencies
cd ../bot
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values (see .env.example)
```

### 3. Database Setup

```bash
cd apps/web
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development

```bash
# Terminal 1 - Web App
cd apps/web
npm run dev

# Terminal 2 - Discord Bot
cd apps/bot
npm run dev
```

### 5. Docker (Production)

```bash
docker-compose up -d
```

---

## 🔧 Discord Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Under OAuth2 → Add redirect: `http://localhost:3000/api/auth/discord/callback`
4. Copy CLIENT_ID and CLIENT_SECRET to .env
5. Under Bot → Create bot → Copy TOKEN
6. Enable: Server Members Intent, Message Content Intent
7. Invite bot with admin permissions

## 💳 Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from Dashboard
3. Set up webhook: `https://yourdomain.com/api/stripe/webhook`
4. Events to listen: `checkout.session.completed`, `payment_intent.payment_failed`

## 🔥 Firebase Setup

1. Create project at https://console.firebase.google.com
2. Enable Phone Authentication
3. Copy config to .env

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd apps/web
vercel --prod
```

### Railway (Bot + Database)
```bash
# Connect Railway to GitHub repo
# Set environment variables in Railway dashboard
# Deploy bot service
```

### Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📜 License

MIT © Legendary Community
