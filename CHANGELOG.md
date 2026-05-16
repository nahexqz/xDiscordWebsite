# Changelog — Legendary Community

All notable changes to this project will be documented here.
Format: [Semantic Versioning](https://semver.org/)

---

## [1.0.0] — 2025-01-01

### 🎉 Initial Release

#### Features Added
- **Discord OAuth2 Authentication** — Login with Discord only, JWT session, HttpOnly cookies
- **Role Shop** — Browse and purchase Discord roles with Stripe Checkout (THB)
- **Stripe Webhook** — Auto role delivery, purchase DMs, failure notifications
- **Verification System** — 3-level identity verification with Firebase phone OTP
  - Level 1: Basic info + phone OTP + screenshot upload
  - Level 2: Live selfie via device camera
  - Level 3: Live ID card capture via device camera
- **Ticket System** — Support ticket creation, admin replies, Discord DM updates
- **Admin Dashboard** — Full management panel with analytics charts
- **Discord Bot** — Role automation, approval/reject buttons, DM notifications
- **Coupon System** — Percentage and fixed discounts with usage limits
- **Announcement Banner** — Admin-managed popups with 24h dismiss

#### Pages
- `/` — Homepage with Discord mockup, stats, featured content, CTA
- `/shop` — Role shop with search, filter, sort, best sellers
- `/shop/[productId]` — Product detail with purchase
- `/verification` — Level 1 verification form
- `/verification-2` — Level 2 selfie capture
- `/verification-3` — Level 3 ID card capture
- `/tickets` — Support ticket management
- `/profile` — User profile with order history
- `/dashboard/admin` — Full admin panel
- `/login` — Discord login page
- `/success` — Payment success confirmation
- `/cancel` — Payment cancellation
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy

#### Tech Stack
- Next.js 15 (App Router), TypeScript, TailwindCSS
- Prisma ORM + PostgreSQL
- Discord OAuth2 + JWT
- Stripe Checkout
- discord.js v14
- Firebase Phone Auth
- Cloudinary file storage
- Socket.io realtime
- Framer Motion animations
- Docker + Nginx deployment

#### Security
- Rate limiting on all sensitive endpoints
- Zod input validation
- CSRF protection via SameSite cookies
- HttpOnly session cookies
- Stripe webhook signature verification
- Admin role-based access control
- File type validation on uploads

---

## Upcoming Features

### [1.1.0] — Planned
- [ ] Email notifications as backup to Discord DMs
- [ ] Role expiry auto-removal via cron job
- [ ] Bulk admin actions for verifications
- [ ] Export orders/users to CSV
- [ ] Discord slash commands for bot
- [ ] Two-factor authentication option
- [ ] Affiliate/referral system
- [ ] Multi-language support (Thai/English)

### [1.2.0] — Planned
- [ ] Subscription roles with recurring billing
- [ ] Discord server statistics widget
- [ ] Public API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Role bundle packages
