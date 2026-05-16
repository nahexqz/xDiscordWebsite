// types/index.ts
// Global TypeScript types for Legendary Community

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  email?: string;
  avatar?: string;
  banner?: string;
  verified?: boolean;
  flags?: number;
}

export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  email?: string | null;
  avatar?: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  lastSeen?: string | null;
  wallet?: Wallet | null;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: "CREDIT" | "DEBIT" | "REFUND" | "PURCHASE";
  description: string;
  orderId?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  roleId: string;
  roleName: string;
  duration?: number | null;
  stock?: number | null;
  soldCount: number;
  isActive: boolean;
  isFeatured: boolean;
  benefits: string[];
  category?: ProductCategory | null;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  description?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  stripeSessionId?: string | null;
  couponId?: string | null;
  discountAmount: number;
  roleGranted: boolean;
  roleGrantedAt?: string | null;
  failureReason?: string | null;
  product: Pick<Product, "id" | "name" | "roleName">;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  productIds: string[];
  createdAt: string;
}

export interface VerificationSubmission {
  id: string;
  userId: string;
  level: 1 | 2 | 3;
  status: VerificationStatus;
  firstName: string;
  lastName: string;
  birthdate: string;
  discordUid: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  otherSocialUrl?: string | null;
  profileScreenshot?: string | null;
  selfieImage?: string | null;
  idCardImage?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectReason?: string | null;
  createdAt: string;
  user: Pick<User, "username" | "avatar" | "discordId">;
}

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Ticket {
  id: string;
  userId: string;
  ticketNumber: number;
  category: string;
  subject: string;
  message: string;
  screenshot?: string | null;
  status: TicketStatus;
  priority: Priority;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "username" | "discordId" | "avatar">;
  replies: TicketReply[];
}

export type TicketStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "FAILED" | "CLOSED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  user: Pick<User, "username">;
}

export interface AdminLog {
  id: string;
  performerId: string;
  targetId?: string | null;
  action: string;
  description: string;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
  performer: Pick<User, "username" | "discordId">;
  target?: Pick<User, "username" | "discordId"> | null;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface BotSettings {
  welcome_message?: string;
  purchase_success_message?: string;
  purchase_failed_message?: string;
  verification_approved_message?: string;
  verification_rejected_message?: string;
  ticket_created_message?: string;
  ticket_updated_message?: string;
  [key: string]: string | undefined;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalRevenue: number;
  revenueToday: number;
  openTickets: number;
  pendingVerifications: number;
  totalOrders: number;
  topProducts: Array<{ name: string; soldCount: number; revenue: number }>;
  revenueChart: Array<{ date: string; revenue: number; orders: number }>;
}

// API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}
