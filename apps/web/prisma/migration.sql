-- Legendary Community — Initial Database Migration
-- Run: npx prisma migrate dev --name init
-- Or apply directly: psql -U postgres -d legendary_community -f migration.sql

-- Enable UUID extension (optional, using cuid via Prisma)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ─────────────────────────────────────────────────────────────────────
CREATE TYPE "TransactionType"   AS ENUM ('CREDIT', 'DEBIT', 'REFUND', 'PURCHASE');
CREATE TYPE "OrderStatus"       AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE "DiscountType"      AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "TicketStatus"      AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'FAILED', 'CLOSED');
CREATE TYPE "Priority"          AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE "users" (
  "id"            TEXT        NOT NULL PRIMARY KEY,
  "discordId"     TEXT        NOT NULL UNIQUE,
  "username"      TEXT        NOT NULL,
  "discriminator" TEXT        NOT NULL DEFAULT '0',
  "email"         TEXT,
  "avatar"        TEXT,
  "banner"        TEXT,
  "phone"         TEXT,
  "createdAt"     TIMESTAMP   NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP   NOT NULL,
  "isAdmin"       BOOLEAN     NOT NULL DEFAULT FALSE,
  "isBanned"      BOOLEAN     NOT NULL DEFAULT FALSE,
  "banReason"     TEXT,
  "lastSeen"      TIMESTAMP
);

-- ── SESSIONS ──────────────────────────────────────────────────────────────────
CREATE TABLE "sessions" (
  "id"        TEXT      NOT NULL PRIMARY KEY,
  "userId"    TEXT      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token"     TEXT      NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT
);
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- ── WALLETS ───────────────────────────────────────────────────────────────────
CREATE TABLE "wallets" (
  "id"        TEXT      NOT NULL PRIMARY KEY,
  "userId"    TEXT      NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "balance"   INT       NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL
);

-- ── WALLET TRANSACTIONS ───────────────────────────────────────────────────────
CREATE TABLE "wallet_transactions" (
  "id"          TEXT              NOT NULL PRIMARY KEY,
  "walletId"    TEXT              NOT NULL REFERENCES "wallets"("id") ON DELETE CASCADE,
  "amount"      INT               NOT NULL,
  "type"        "TransactionType" NOT NULL,
  "description" TEXT              NOT NULL,
  "orderId"     TEXT,
  "createdAt"   TIMESTAMP         NOT NULL DEFAULT NOW()
);
CREATE INDEX "wallet_transactions_walletId_idx" ON "wallet_transactions"("walletId");

-- ── PRODUCT CATEGORIES ────────────────────────────────────────────────────────
CREATE TABLE "product_categories" (
  "id"          TEXT      NOT NULL PRIMARY KEY,
  "name"        TEXT      NOT NULL,
  "slug"        TEXT      NOT NULL UNIQUE,
  "description" TEXT,
  "emoji"       TEXT,
  "sortOrder"   INT       NOT NULL DEFAULT 0,
  "isActive"    BOOLEAN   NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL
);

-- ── PRODUCTS ──────────────────────────────────────────────────────────────────
CREATE TABLE "products" (
  "id"              TEXT      NOT NULL PRIMARY KEY,
  "categoryId"      TEXT      REFERENCES "product_categories"("id"),
  "name"            TEXT      NOT NULL,
  "slug"            TEXT      NOT NULL UNIQUE,
  "description"     TEXT      NOT NULL,
  "shortDesc"       TEXT,
  "price"           INT       NOT NULL,
  "originalPrice"   INT,
  "image"           TEXT,
  "roleId"          TEXT      NOT NULL,
  "roleName"        TEXT      NOT NULL,
  "duration"        INT,
  "stock"           INT,
  "soldCount"       INT       NOT NULL DEFAULT 0,
  "isActive"        BOOLEAN   NOT NULL DEFAULT TRUE,
  "isFeatured"      BOOLEAN   NOT NULL DEFAULT FALSE,
  "sortOrder"       INT       NOT NULL DEFAULT 0,
  "stripeProductId" TEXT,
  "stripePriceId"   TEXT,
  "benefits"        TEXT[]    NOT NULL DEFAULT '{}',
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL
);
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_isActive_idx"   ON "products"("isActive");

-- ── COUPONS ───────────────────────────────────────────────────────────────────
CREATE TABLE "coupons" (
  "id"              TEXT           NOT NULL PRIMARY KEY,
  "code"            TEXT           NOT NULL UNIQUE,
  "description"     TEXT,
  "discountType"    "DiscountType" NOT NULL,
  "discountValue"   INT            NOT NULL,
  "minOrderAmount"  INT            NOT NULL DEFAULT 0,
  "maxUses"         INT,
  "usedCount"       INT            NOT NULL DEFAULT 0,
  "isActive"        BOOLEAN        NOT NULL DEFAULT TRUE,
  "expiresAt"       TIMESTAMP,
  "productIds"      TEXT[]         NOT NULL DEFAULT '{}',
  "createdAt"       TIMESTAMP      NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP      NOT NULL
);

-- ── ORDERS ────────────────────────────────────────────────────────────────────
CREATE TABLE "orders" (
  "id"                  TEXT          NOT NULL PRIMARY KEY,
  "userId"              TEXT          NOT NULL REFERENCES "users"("id"),
  "productId"           TEXT          NOT NULL REFERENCES "products"("id"),
  "amount"              INT           NOT NULL,
  "currency"            TEXT          NOT NULL DEFAULT 'thb',
  "status"              "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "stripeSessionId"     TEXT          UNIQUE,
  "stripePaymentIntent" TEXT,
  "couponId"            TEXT          REFERENCES "coupons"("id"),
  "discountAmount"      INT           NOT NULL DEFAULT 0,
  "roleGranted"         BOOLEAN       NOT NULL DEFAULT FALSE,
  "roleGrantedAt"       TIMESTAMP,
  "dmSent"              BOOLEAN       NOT NULL DEFAULT FALSE,
  "failureReason"       TEXT,
  "metadata"            JSONB,
  "createdAt"           TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMP     NOT NULL
);
CREATE INDEX "orders_userId_idx"    ON "orders"("userId");
CREATE INDEX "orders_productId_idx" ON "orders"("productId");
CREATE INDEX "orders_status_idx"    ON "orders"("status");

-- ── VERIFICATION SUBMISSIONS ──────────────────────────────────────────────────
CREATE TABLE "verification_submissions" (
  "id"                TEXT                 NOT NULL PRIMARY KEY,
  "userId"            TEXT                 NOT NULL REFERENCES "users"("id"),
  "level"             INT                  NOT NULL,
  "status"            "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "firstName"         TEXT                 NOT NULL,
  "lastName"          TEXT                 NOT NULL,
  "birthdate"         TIMESTAMP            NOT NULL,
  "discordUid"        TEXT                 NOT NULL,
  "email"             TEXT                 NOT NULL,
  "phone"             TEXT                 NOT NULL,
  "phoneVerified"     BOOLEAN              NOT NULL DEFAULT FALSE,
  "facebookUrl"       TEXT,
  "instagramUrl"      TEXT,
  "otherSocialUrl"    TEXT,
  "profileScreenshot" TEXT,
  "selfieImage"       TEXT,
  "idCardImage"       TEXT,
  "reviewedBy"        TEXT,
  "reviewedAt"        TIMESTAMP,
  "rejectReason"      TEXT,
  "discordMessageId"  TEXT,
  "createdAt"         TIMESTAMP            NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP            NOT NULL
);
CREATE INDEX "verification_submissions_userId_idx" ON "verification_submissions"("userId");
CREATE INDEX "verification_submissions_status_idx" ON "verification_submissions"("status");

-- ── TICKETS ───────────────────────────────────────────────────────────────────
CREATE SEQUENCE "ticket_number_seq" START 1000;

CREATE TABLE "tickets" (
  "id"           TEXT           NOT NULL PRIMARY KEY,
  "userId"       TEXT           NOT NULL REFERENCES "users"("id"),
  "ticketNumber" INT            NOT NULL DEFAULT nextval('ticket_number_seq'),
  "category"     TEXT           NOT NULL,
  "subject"      TEXT           NOT NULL,
  "message"      TEXT           NOT NULL,
  "screenshot"   TEXT,
  "status"       "TicketStatus" NOT NULL DEFAULT 'PENDING',
  "priority"     "Priority"     NOT NULL DEFAULT 'MEDIUM',
  "assignedTo"   TEXT,
  "resolvedAt"   TIMESTAMP,
  "createdAt"    TIMESTAMP      NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMP      NOT NULL
);
CREATE INDEX "tickets_userId_idx"  ON "tickets"("userId");
CREATE INDEX "tickets_status_idx"  ON "tickets"("status");
CREATE UNIQUE INDEX "tickets_ticketNumber_idx" ON "tickets"("ticketNumber");

-- ── TICKET REPLIES ────────────────────────────────────────────────────────────
CREATE TABLE "ticket_replies" (
  "id"        TEXT      NOT NULL PRIMARY KEY,
  "ticketId"  TEXT      NOT NULL REFERENCES "tickets"("id") ON DELETE CASCADE,
  "userId"    TEXT      NOT NULL REFERENCES "users"("id"),
  "message"   TEXT      NOT NULL,
  "isAdmin"   BOOLEAN   NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX "ticket_replies_ticketId_idx" ON "ticket_replies"("ticketId");

-- ── ADMIN LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE "admin_logs" (
  "id"          TEXT      NOT NULL PRIMARY KEY,
  "performerId" TEXT      NOT NULL REFERENCES "users"("id"),
  "targetId"    TEXT      REFERENCES "users"("id"),
  "action"      TEXT      NOT NULL,
  "description" TEXT      NOT NULL,
  "metadata"    JSONB,
  "ipAddress"   TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX "admin_logs_performerId_idx" ON "admin_logs"("performerId");
CREATE INDEX "admin_logs_createdAt_idx"   ON "admin_logs"("createdAt");

-- ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
CREATE TABLE "announcements" (
  "id"        TEXT      NOT NULL PRIMARY KEY,
  "title"     TEXT      NOT NULL,
  "message"   TEXT      NOT NULL,
  "type"      TEXT      NOT NULL DEFAULT 'info',
  "isActive"  BOOLEAN   NOT NULL DEFAULT TRUE,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL
);

-- ── BOT SETTINGS ──────────────────────────────────────────────────────────────
CREATE TABLE "bot_settings" (
  "id"          TEXT      NOT NULL PRIMARY KEY,
  "key"         TEXT      NOT NULL UNIQUE,
  "value"       TEXT      NOT NULL,
  "description" TEXT,
  "updatedAt"   TIMESTAMP NOT NULL
);

-- ── DISCORD ROLE MAPPINGS ─────────────────────────────────────────────────────
CREATE TABLE "discord_role_mappings" (
  "id"        TEXT      NOT NULL PRIMARY KEY,
  "productId" TEXT      UNIQUE,
  "roleId"    TEXT      NOT NULL UNIQUE,
  "roleName"  TEXT      NOT NULL,
  "type"      TEXT      NOT NULL,
  "isActive"  BOOLEAN   NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL
);

-- ── SITE SETTINGS ─────────────────────────────────────────────────────────────
CREATE TABLE "site_settings" (
  "id"          TEXT      NOT NULL PRIMARY KEY,
  "key"         TEXT      NOT NULL UNIQUE,
  "value"       TEXT      NOT NULL,
  "type"        TEXT      NOT NULL DEFAULT 'string',
  "description" TEXT,
  "updatedAt"   TIMESTAMP NOT NULL
);

-- ── SEED: Default Bot Settings ────────────────────────────────────────────────
INSERT INTO "bot_settings" ("id", "key", "value", "updatedAt") VALUES
  (gen_random_uuid()::text, 'welcome_message',                 '👋 Welcome to **Legendary Community**, {username}! 🎮', NOW()),
  (gen_random_uuid()::text, 'purchase_success_message',        '🎉 **Purchase Successful!**\n\nThank you {username}! Your **{role}** role has been granted.\n💰 Amount: ฿{amount} THB', NOW()),
  (gen_random_uuid()::text, 'purchase_failed_message',         '❌ **Payment Failed**\n\nHi {username}, your payment for **{role}** could not be processed.\n\nPlease try again or contact support.', NOW()),
  (gen_random_uuid()::text, 'verification_approved_message',   '✅ **Verification Approved!**\n\nCongratulations {username}! Your Level {level} verification has been approved. 🎉', NOW()),
  (gen_random_uuid()::text, 'verification_rejected_message',   '❌ **Verification Rejected**\n\nHi {username}, your Level {level} verification was rejected.\n\n📝 Reason: {reason}', NOW()),
  (gen_random_uuid()::text, 'ticket_created_message',          '🎫 **Ticket Created!**\n\nHi {username}, your ticket **#{ticket_id}** has been received. Our team will respond soon!', NOW()),
  (gen_random_uuid()::text, 'ticket_updated_message',          '📋 **Ticket Update**\n\nYour ticket **#{ticket_id}** status has been updated to: **{status}**', NOW())
ON CONFLICT ("key") DO NOTHING;
