// lib/validations.ts
// Centralised Zod schemas shared between frontend and backend

import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const discordCallbackSchema = z.object({
  code: z.string().min(1),
});

// ── Verification Level 1 ──────────────────────────────────────────────────────
export const verificationL1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName:  z.string().min(2, "Last name must be at least 2 characters"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  phone:     z.string().min(9, "Enter a valid phone number"),
  facebookUrl:   z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramUrl:  z.string().url("Invalid URL").optional().or(z.literal("")),
  otherSocialUrl:z.string().url("Invalid URL").optional().or(z.literal("")),
  level: z.literal("1"),
});

// ── Ticket ────────────────────────────────────────────────────────────────────
export const createTicketSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subject:  z.string().min(5, "Subject must be at least 5 characters").max(100),
  message:  z.string().min(10, "Message must be at least 10 characters").max(2000),
});

// ── Checkout ──────────────────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  productId:  z.string().cuid("Invalid product ID"),
  couponCode: z.string().max(30).optional(),
});

// ── Coupon ────────────────────────────────────────────────────────────────────
export const couponValidateSchema = z.object({
  code: z.string().min(1).max(30),
});

export const createCouponSchema = z.object({
  code:          z.string().min(3).max(30).toUpperCase(),
  description:   z.string().max(200).optional(),
  discountType:  z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int().min(1),
  minOrderAmount:z.number().int().min(0).default(0),
  maxUses:       z.number().int().min(1).nullable().optional(),
  expiresAt:     z.string().datetime().nullable().optional(),
  productIds:    z.array(z.string()).default([]),
  isActive:      z.boolean().default(true),
});

// ── Product ───────────────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  name:         z.string().min(2).max(100),
  description:  z.string().min(10).max(2000),
  price:        z.number().int().min(100),   // min ฿1 (100 satang)
  originalPrice:z.number().int().min(0).optional(),
  roleId:       z.string().min(17).max(20),  // Discord snowflake
  roleName:     z.string().min(1).max(100),
  categoryId:   z.string().cuid().optional(),
  stock:        z.number().int().min(0).nullable().optional(),
  duration:     z.number().int().min(1).nullable().optional(),
  benefits:     z.array(z.string().max(200)).max(10).default([]),
  isActive:     z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
  sortOrder:    z.number().int().default(0),
});

// ── Admin User Update ─────────────────────────────────────────────────────────
export const updateUserSchema = z.object({
  isBanned:  z.boolean().optional(),
  isAdmin:   z.boolean().optional(),
  banReason: z.string().max(500).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

// ── Announcement ──────────────────────────────────────────────────────────────
export const createAnnouncementSchema = z.object({
  title:     z.string().min(2).max(100),
  message:   z.string().min(5).max(1000),
  type:      z.enum(["info", "warning", "success", "error"]).default("info"),
  isActive:  z.boolean().default(true),
  expiresAt: z.string().datetime().nullable().optional(),
});

// ── Ticket Reply ──────────────────────────────────────────────────────────────
export const ticketReplySchema = z.object({
  message: z.string().min(1).max(2000),
});

// ── Ticket Status Update ──────────────────────────────────────────────────────
export const ticketStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "FAILED", "CLOSED"]),
});

// ── Verification Reject ───────────────────────────────────────────────────────
export const verificationRejectSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason").max(500),
});
