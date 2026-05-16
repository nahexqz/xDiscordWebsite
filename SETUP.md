# 🛠️ Local Development Setup

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| PostgreSQL | 15+ | https://postgresql.org |
| Git | Any | https://git-scm.com |

---

## 1. Clone & Install

```bash
git clone https://github.com/yourorg/legendary-community.git
cd legendary-community

# Install web app dependencies
cd apps/web
npm install

# Install bot dependencies
cd ../bot
npm install
cd ../..
```

---

## 2. Environment Variables

```bash
# Copy the example env file
cp .env.example apps/web/.env.local
cp .env.example apps/bot/.env
```

Edit `apps/web/.env.local` and fill in all required values.

**Minimum required for local development:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/legendary_community"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
DISCORD_CLIENT_ID="your_client_id"
DISCORD_CLIENT_SECRET="your_client_secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"
DISCORD_BOT_TOKEN="your_bot_token"
DISCORD_GUILD_ID="your_server_id"
DISCORD_ADMIN_CHANNEL_ID="your_channel_id"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLOUDINARY_CLOUD_NAME="your_cloud"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_DISCORD_IDS="your_discord_user_id"
```

---

## 3. Database Setup

```bash
# Create the database
createdb legendary_community
# or with psql:
psql -U postgres -c "CREATE DATABASE legendary_community;"

cd apps/web

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed

# Optional: Open Prisma Studio to inspect data
npx prisma studio
```

---

## 4. Stripe Webhook (Local Testing)

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows / Linux: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret from the Stripe CLI output and set:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 5. Run Development Servers

Open **3 terminal windows**:

**Terminal 1 — Web App:**
```bash
cd apps/web
npm run dev
# Opens at http://localhost:3000
```

**Terminal 2 — Discord Bot:**
```bash
cd apps/bot
npm run dev
```

**Terminal 3 — Stripe Webhook Forwarding:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 6. First Admin Setup

1. Start the app and visit `http://localhost:3000`
2. Click **JOIN DISCORD** to log in with your Discord account
3. Your Discord ID should be in `ADMIN_DISCORD_IDS` env var
4. Visit `http://localhost:3000/dashboard/admin`

---

## 7. Testing the Full Flow

### Test Discord Login
1. Click "JOIN DISCORD" on homepage
2. Authorize the app
3. You should be redirected back and logged in

### Test a Purchase
1. Go to `/shop`
2. Click "Buy Now" on any product
3. Use Stripe test card: `4242 4242 4242 4242` (any future date/CVC)
4. Should redirect to `/success` and Discord role should be granted

### Test Verification
1. Go to `/verification`
2. Fill in the form and verify your phone via OTP
3. Submit — check the admin Discord channel for the approval message
4. Click "Approve" in Discord — the verification role should be granted

### Test Ticket
1. Go to `/tickets` → Create New Ticket
2. Submit a ticket
3. Check Discord for the notification
4. Go to `/dashboard/admin` → Tickets to manage it

---

## 8. Project Structure Reference

```
legendary-community/
├── apps/
│   ├── web/                     # Next.js 15 app
│   │   ├── app/                 # App Router pages
│   │   │   ├── api/             # API routes
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── shop/            # Shop pages
│   │   │   ├── verification*/   # Verification L1/L2/L3
│   │   │   ├── tickets/         # Ticket system
│   │   │   ├── profile/         # User profile
│   │   │   ├── dashboard/admin/ # Admin panel
│   │   │   ├── login/           # Login page
│   │   │   ├── success/         # Payment success
│   │   │   └── cancel/          # Payment cancel
│   │   ├── components/          # React components
│   │   │   ├── admin/           # Admin dashboard tabs
│   │   │   ├── shop/            # Product cards
│   │   │   └── ui/              # UI primitives
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Server utilities
│   │   │   ├── auth.ts          # JWT + session
│   │   │   ├── prisma.ts        # DB client
│   │   │   ├── stripe.ts        # Stripe client
│   │   │   ├── cloudinary.ts    # File uploads
│   │   │   ├── firebase.ts      # Phone OTP
│   │   │   ├── discord-bot.ts   # Bot API calls
│   │   │   ├── rate-limit.ts    # Rate limiting
│   │   │   └── validations.ts   # Zod schemas
│   │   ├── store/               # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   └── prisma/              # Database schema + seed
│   └── bot/                     # Discord.js bot
│       └── src/index.ts         # Bot main file
├── packages/
│   └── prisma/schema.prisma     # Shared Prisma schema
├── nginx/nginx.conf             # Nginx config
├── docker-compose.yml           # Docker setup
├── .env.example                 # Environment template
├── README.md                    # Project overview
├── DEPLOYMENT.md                # Deployment guide
└── SETUP.md                     # This file
```

---

## 9. Common Issues & Fixes

### Prisma Client Not Generated
```bash
cd apps/web && npx prisma generate
```

### Discord OAuth Redirect Mismatch
Ensure `DISCORD_REDIRECT_URI` exactly matches the redirect URI in your Discord app settings (including `http://` vs `https://`).

### Stripe Webhook Signature Failed
Make sure you're using the webhook secret from `stripe listen` output (for local), not the Stripe Dashboard secret.

### Phone OTP Not Working
1. Check that your Firebase project has Phone Authentication enabled
2. For development, add `localhost` to Firebase Authorized Domains
3. The invisible reCAPTCHA may be blocked by ad blockers — test in incognito

### Bot Not Granting Roles
1. Ensure the bot is in your server
2. The bot's role must be **higher** than roles it's trying to assign
3. Check that role IDs in `.env` are correct (18-digit Discord snowflakes)

### Image Upload Failing
1. Verify Cloudinary credentials are correct
2. Check file size (max 10MB)
3. Ensure you're uploading image files only (jpg/png/webp)
