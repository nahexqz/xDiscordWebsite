#!/usr/bin/env bash
# ============================================================
# Legendary Community — Automated First-Time Setup Script
# Usage: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Header
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     LEGENDARY COMMUNITY — SETUP SCRIPT    ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ── Check prerequisites ──────────────────────────────────────
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ $1 is not installed. Please install it first.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ $1 found: $(command -v "$1")${NC}"
}

check_command node
check_command npm
check_command psql

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo -e "${RED}✗ Node.js 20+ required (found v$NODE_VERSION)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js version OK: $(node -v)${NC}"

# ── Copy environment file ────────────────────────────────────
echo ""
echo -e "${BLUE}[2/6] Setting up environment variables...${NC}"

if [ ! -f "apps/web/.env.local" ]; then
  cp .env.example apps/web/.env.local
  cp .env.example apps/bot/.env
  echo -e "${YELLOW}⚠  .env.local created from .env.example${NC}"
  echo -e "${YELLOW}   Please fill in your values in apps/web/.env.local${NC}"
  echo ""
  echo -e "${YELLOW}   Required values:${NC}"
  echo -e "${YELLOW}   - DATABASE_URL${NC}"
  echo -e "${YELLOW}   - JWT_SECRET (generate: openssl rand -hex 32)${NC}"
  echo -e "${YELLOW}   - DISCORD_CLIENT_ID & DISCORD_CLIENT_SECRET${NC}"
  echo -e "${YELLOW}   - DISCORD_BOT_TOKEN${NC}"
  echo -e "${YELLOW}   - DISCORD_GUILD_ID${NC}"
  echo -e "${YELLOW}   - STRIPE_SECRET_KEY & STRIPE_WEBHOOK_SECRET${NC}"
  echo -e "${YELLOW}   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET${NC}"
  echo -e "${YELLOW}   - NEXT_PUBLIC_FIREBASE_* values${NC}"
  echo -e "${YELLOW}   - ADMIN_DISCORD_IDS (your Discord user ID)${NC}"
  echo ""
  read -p "Press ENTER after filling in .env.local to continue..."
else
  echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# ── Install dependencies ─────────────────────────────────────
echo ""
echo -e "${BLUE}[3/6] Installing dependencies...${NC}"

echo -e "${YELLOW}Installing web app dependencies...${NC}"
cd apps/web && npm install --legacy-peer-deps
echo -e "${GREEN}✓ Web dependencies installed${NC}"

cd ../bot && npm install
echo -e "${GREEN}✓ Bot dependencies installed${NC}"
cd ../..

# ── Database setup ───────────────────────────────────────────
echo ""
echo -e "${BLUE}[4/6] Setting up database...${NC}"

# Source env vars for database URL
export $(grep -v '^#' apps/web/.env.local | grep DATABASE_URL | xargs) 2>/dev/null || true

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}DATABASE_URL not found in .env.local, using default...${NC}"
  DATABASE_URL="postgresql://postgres:password@localhost:5432/legendary_community"
fi

# Create database if it doesn't exist
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\///')
echo -e "${YELLOW}Creating database '$DB_NAME' if it doesn't exist...${NC}"
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo -e "${YELLOW}Database already exists (OK)${NC}"

# Run Prisma migrations
echo -e "${YELLOW}Running Prisma migrations...${NC}"
cd apps/web
npx prisma generate
npx prisma migrate dev --name init --skip-seed 2>/dev/null || npx prisma db push
echo -e "${GREEN}✓ Database migrated${NC}"

# Seed database
echo -e "${YELLOW}Seeding database with sample data...${NC}"
npx tsx prisma/seed.ts
echo -e "${GREEN}✓ Database seeded${NC}"
cd ../..

# ── Verify setup ─────────────────────────────────────────────
echo ""
echo -e "${BLUE}[5/6] Verifying setup...${NC}"

if [ -f "apps/web/.env.local" ]; then
  echo -e "${GREEN}✓ Environment file exists${NC}"
fi

if [ -d "apps/web/node_modules" ]; then
  echo -e "${GREEN}✓ Web dependencies installed${NC}"
fi

if [ -d "apps/bot/node_modules" ]; then
  echo -e "${GREEN}✓ Bot dependencies installed${NC}"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[6/6] Setup complete!${NC}"
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║              NEXT STEPS                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Start development servers:${NC}"
echo ""
echo -e "  ${YELLOW}Terminal 1 (Web App):${NC}"
echo -e "  cd apps/web && npm run dev"
echo ""
echo -e "  ${YELLOW}Terminal 2 (Discord Bot):${NC}"
echo -e "  cd apps/bot && npm run dev"
echo ""
echo -e "  ${YELLOW}Terminal 3 (Stripe Webhooks):${NC}"
echo -e "  stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
echo -e "${GREEN}Access the app at:${NC} http://localhost:3000"
echo -e "${GREEN}Admin dashboard at:${NC} http://localhost:3000/dashboard/admin"
echo -e "${GREEN}Prisma Studio at:${NC} Run 'cd apps/web && npx prisma studio'"
echo ""
echo -e "${YELLOW}Default admin coupon: WELCOME20 (20% off)${NC}"
echo ""
echo -e "${GREEN}Happy building! 🎮${NC}"
echo ""
