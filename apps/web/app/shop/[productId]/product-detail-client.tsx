"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Crown, Check, Clock, Infinity, ShoppingCart, Loader2, Lock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

interface Product {
  id: string; name: string; description: string; price: number;
  originalPrice?: number | null; image?: string | null; roleName: string;
  soldCount: number; isFeatured: boolean; benefits: string[];
  category?: { name: string; slug: string; emoji?: string | null } | null;
  stock?: number | null; duration?: number | null;
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuy = async () => {
    if (!user) { window.location.href = "/api/auth/discord"; return; }
    try {
      setLoading(true);
      const res = await axios.post("/api/orders/checkout", {
        productId: product.id,
        couponCode: couponCode || undefined,
      });
      window.location.href = res.data.url;
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create checkout session");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-28">
        {/* Back */}
        <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left - Visual */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-card neon-border overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-purple-900/50 to-black/80 flex items-center justify-center">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover opacity-60" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-800/40 flex items-center justify-center">
                    <Crown className="h-16 w-16 text-purple-300" />
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 badge-red">-{discount}%</div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {product.category && (
                  <span className="text-sm text-purple-400">{product.category.emoji} {product.category.name}</span>
                )}
                <h1 className="font-display text-3xl font-black text-white">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  {product.duration ? (
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{product.duration} days</span>
                  ) : (
                    <span className="flex items-center gap-1"><Infinity className="h-4 w-4" />Permanent</span>
                  )}
                  <span>•</span>
                  <span>{product.soldCount} sold</span>
                  {product.stock != null && (
                    <><span>•</span><span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>{product.stock > 0 ? `${product.stock} left` : "Out of stock"}</span></>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Purchase panel */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Description */}
            <div className="glass-card neon-border p-6">
              <h2 className="font-display text-lg font-bold text-white mb-3">Description</h2>
              <p className="text-white/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Benefits */}
            {product.benefits.length > 0 && (
              <div className="glass-card neon-border p-6">
                <h2 className="font-display text-lg font-bold text-white mb-4">What you get</h2>
                <ul className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchase card */}
            <div className="glass-card neon-border p-6 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  {product.originalPrice && (
                    <p className="text-sm text-white/40 line-through">฿{(product.originalPrice / 100).toFixed(0)}</p>
                  )}
                  <p className="font-display text-4xl font-black gradient-text">
                    ฿{(product.price / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-white/40">THB</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Discord Role</p>
                  <p className="text-sm font-semibold text-purple-300">{product.roleName}</p>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code..."
                  className="form-input flex-1 text-sm py-2"
                />
              </div>

              <button
                onClick={handleBuy}
                disabled={loading || (product.stock != null && product.stock <= 0)}
                className="btn-glow w-full flex items-center justify-center gap-2 py-4 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : !user ? (
                  <><Lock className="h-5 w-5" />Login to Purchase</>
                ) : product.stock != null && product.stock <= 0 ? (
                  "Out of Stock"
                ) : (
                  <><ShoppingCart className="h-5 w-5" />Purchase Now</>
                )}
              </button>

              <p className="text-center text-xs text-white/30">
                Secured by Stripe • Role delivered instantly after payment
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
