# 🚀 Deployment Guide — Legendary Community

## Option A: Vercel (Frontend) + Railway (DB + Bot) — Recommended

### 1. Deploy Database on Railway

1. Create a Railway account at https://railway.app
2. Create a new project → Add PostgreSQL
3. Copy the `DATABASE_URL` connection string from Railway
4. Run migrations:
   ```bash
   DATABASE_URL="your-railway-url" npx prisma migrate deploy
   DATABASE_URL="your-railway-url" npx prisma db seed
   ```

### 2. Deploy Web App on Vercel

```bash
cd apps/web
npm i -g vercel
vercel login
vercel --prod
```

Set these environment variables in Vercel dashboard:
```
DATABASE_URL              = (Railway PostgreSQL URL)
JWT_SECRET                = (random 32+ char string)
DISCORD_CLIENT_ID         = (from Discord Developer Portal)
DISCORD_CLIENT_SECRET     = (from Discord Developer Portal)
DISCORD_REDIRECT_URI      = https://yourdomain.vercel.app/api/auth/discord/callback
DISCORD_BOT_TOKEN         = (your bot token)
DISCORD_GUILD_ID          = (your server ID)
DISCORD_ADMIN_CHANNEL_ID  = (admin channel ID)
DISCORD_LOG_CHANNEL_ID    = (log channel ID)
DISCORD_TICKET_CHANNEL_ID = (ticket channel ID)
DISCORD_ROLE_VERIFIED_L1  = (role ID)
DISCORD_ROLE_VERIFIED_L2  = (role ID)
DISCORD_ROLE_VERIFIED_L3  = (role ID)
STRIPE_SECRET_KEY         = (from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY    = (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET     = (from Stripe webhook setup)
CLOUDINARY_CLOUD_NAME     = (from Cloudinary)
CLOUDINARY_API_KEY        = (from Cloudinary)
CLOUDINARY_API_SECRET     = (from Cloudinary)
NEXT_PUBLIC_FIREBASE_API_KEY          = (from Firebase)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN      = (from Firebase)
NEXT_PUBLIC_FIREBASE_PROJECT_ID       = (from Firebase)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET   = (from Firebase)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (from Firebase)
NEXT_PUBLIC_FIREBASE_APP_ID           = (from Firebase)
NEXT_PUBLIC_APP_URL       = https://yourdomain.vercel.app
NEXT_PUBLIC_DISCORD_CLIENT_ID = (same as DISCORD_CLIENT_ID)
ADMIN_DISCORD_IDS         = (comma-separated Discord user IDs)
```

### 3. Deploy Discord Bot on Railway

1. In Railway project → Add new service → GitHub repo
2. Set root directory to `apps/bot`
3. Add same env vars as web app
4. Railway auto-deploys on push

### 4. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://yourdomain.vercel.app/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret → set as `STRIPE_WEBHOOK_SECRET`

---

## Option B: Docker Compose (Self-Hosted VPS)

### Prerequisites
- Ubuntu 22.04 VPS (min 2GB RAM)
- Docker + Docker Compose installed
- Domain pointing to your VPS IP

### Steps

```bash
# 1. Clone repository
git clone https://github.com/yourorg/legendary-community.git
cd legendary-community

# 2. Configure environment
cp .env.example .env
nano .env   # Fill in all values

# 3. Build and start
docker-compose up -d --build

# 4. Run migrations
docker-compose exec web npx prisma migrate deploy
docker-compose exec web npx prisma db seed

# 5. Check logs
docker-compose logs -f web
docker-compose logs -f bot
```

### SSL with Certbot

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

Update `nginx/nginx.conf` to use SSL:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    # ... rest of config
}
```

---

## Discord Bot Setup

### 1. Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name it "Legendary Community"
3. Go to **OAuth2** → Add redirect:
   - `http://localhost:3000/api/auth/discord/callback` (dev)
   - `https://yourdomain.com/api/auth/discord/callback` (prod)
4. Copy **Client ID** and **Client Secret**

### 2. Create Bot

1. Go to **Bot** tab → **Add Bot**
2. Copy **Token**
3. Enable **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
4. Under **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator` (or granular: Manage Roles, Send Messages, Read Messages, Use Slash Commands)
5. Copy generated URL → Open in browser → Invite bot to server

### 3. Get Role IDs

1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click on a role → **Copy ID**
3. Add to `.env`:
   ```
   DISCORD_ROLE_VERIFIED_L1=123456789
   DISCORD_ROLE_VERIFIED_L2=123456790
   DISCORD_ROLE_VERIFIED_L3=123456791
   ```

### 4. Bot Role Hierarchy

⚠️ **Important**: The bot's role must be **above** any roles it needs to assign.
In Discord Server Settings → Roles → Drag "Legendary Bot" role to the top.

---

## Firebase Phone OTP Setup

1. Go to https://console.firebase.google.com
2. Create new project → Add web app
3. Go to **Authentication** → **Sign-in method** → Enable **Phone**
4. Add your domain to **Authorized domains**:
   - `localhost`
   - `yourdomain.com`
5. Copy config values to `.env`

**For production**, add app check:
1. Go to **App Check** → Register your web app
2. Use reCAPTCHA Enterprise provider

---

## Cloudinary Setup

1. Sign up at https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. From Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Create upload presets (optional for direct browser uploads)

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check web app
curl https://yourdomain.com/api/auth/me

# Check database
docker-compose exec postgres pg_isready

# Check bot logs
docker-compose logs --tail=50 bot
```

### Database Backups
```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres legendary_community > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U postgres legendary_community < backup_20250101.sql
```

### Update Deployment
```bash
git pull
docker-compose up -d --build
docker-compose exec web npx prisma migrate deploy
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (32+ chars) |
| `DISCORD_CLIENT_ID` | ✅ | OAuth2 client ID |
| `DISCORD_CLIENT_SECRET` | ✅ | OAuth2 client secret |
| `DISCORD_REDIRECT_URI` | ✅ | OAuth2 callback URL |
| `DISCORD_BOT_TOKEN` | ✅ | Bot authentication token |
| `DISCORD_GUILD_ID` | ✅ | Your Discord server ID |
| `DISCORD_ADMIN_CHANNEL_ID` | ✅ | Channel for admin notifications |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key (phone OTP) |
| `ADMIN_DISCORD_IDS` | ✅ | Comma-separated admin Discord IDs |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full URL of your web app |
