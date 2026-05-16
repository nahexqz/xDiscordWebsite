"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Crown, Clock, Infinity, Check, Loader2, Lock } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  roleName: string;
  soldCount: number;
  isFeatured: boolean;
  benefits: string[];
  category?: { name: string; slug: string; emoji?: string };
  stock?: number;
  duration?: number;
}

interface ProductCardProps {
  product: Product;
  user: any;
  appliedCoupon?: { discount: number; type: string } | null;
  couponCode?: string;
}

export function ProductCard({ product, user, appliedCoupon, couponCode }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const discountedPrice = appliedCoupon
    ? appliedCoupon.type === "PERCENTAGE"
      ? product.price * (1 - appliedCoupon.discount / 100)
      : Math.max(0, product.price - appliedCoupon.discount)
    : product.price;

  const handleBuy = async () => {
    if (!user) {
      window.location.href = "/api/auth/discord";
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/orders/checkout", {
        productId: product.id,
        couponCode: couponCode || undefined,
      });
      window.location.href = res.data.url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="product-card flex flex-col"
    >
      {/* Image / Role Visual */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-900/50 to-black/80">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-800/40 flex items-center justify-center">
              <Crown className="h-10 w-10 text-purple-300" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {product.isFeatured && (
            <span className="badge-purple flex items-center gap-1">
              <Crown className="h-3 w-3" /> Featured
            </span>
          )}
          {discount > 0 && (
            <span className="badge-red">-{discount}%</span>
          )}
        </div>

        {/* Stock badge */}
        {product.stock !== null && product.stock !== undefined && (
          <div className="absolute right-3 top-3">
            <span className={product.stock > 0 ? "badge-green" : "badge-red"}>
              {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="mb-2 text-xs text-purple-400">
            {product.category.emoji} {product.category.name}
          </span>
        )}

        <h3 className="font-display text-base font-bold text-white mb-1">{product.name}</h3>

        <p className="text-xs text-white/50 flex-1 leading-relaxed line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Benefits */}
        {product.benefits.length > 0 && (
          <ul className="mb-4 space-y-1">
            {product.benefits.slice(0, 3).map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-xs text-white/60">
                <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        )}

        {/* Meta info */}
        <div className="mb-4 flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            {product.duration ? (
              <>
                <Clock className="h-3 w-3" />
                {product.duration}d
              </>
            ) : (
              <>
                <Infinity className="h-3 w-3" />
                Permanent
              </>
            )}
          </span>
          <span>•</span>
          <span>{product.soldCount} sold</span>
        </div>

        {/* Price */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            {appliedCoupon ? (
              <div>
                <p className="text-xs text-white/40 line-through">฿{(product.price / 100).toFixed(0)}</p>
                <p className="font-display text-xl font-black gradient-text">
                  ฿{(discountedPrice / 100).toFixed(0)}
                </p>
              </div>
            ) : (
              <div>
                {product.originalPrice && (
                  <p className="text-xs text-white/40 line-through">
                    ฿{(product.originalPrice / 100).toFixed(0)}
                  </p>
                )}
                <p className="font-display text-xl font-black gradient-text">
                  ฿{(product.price / 100).toFixed(0)}
                </p>
              </div>
            )}
            <p className="text-xs text-white/30">THB</p>
          </div>

          <Link
            href={`/shop/${product.id}`}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Details →
          </Link>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={loading || (product.stock !== null && product.stock !== undefined && product.stock <= 0)}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            product.stock !== null && product.stock !== undefined && product.stock <= 0
              ? "cursor-not-allowed bg-white/5 text-white/30"
              : "btn-glow text-white"
          }`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !user ? (
            <>
              <Lock className="h-4 w-4" />
              Login to Buy
            </>
          ) : product.stock !== null && product.stock !== undefined && product.stock <= 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Buy Now
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
