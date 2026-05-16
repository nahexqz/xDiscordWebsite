"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShoppingBag, Star, Zap, Crown, Tag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
}

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Selling", value: "bestselling" },
  { label: "Newest", value: "newest" },
];

export default function ShopPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ discount: number; type: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [topSelling, setTopSelling] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/products", {
        params: { search, category: selectedCategory !== "all" ? selectedCategory : undefined, sort: sortBy },
      });
      setProducts(res.data.products || []);
      setTopSelling(res.data.topSelling || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/products/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const applyCoupon = async () => {
    try {
      setCouponError("");
      const res = await axios.post("/api/coupons/validate", { code: couponCode });
      setCouponApplied(res.data);
    } catch (err: any) {
      setCouponError(err.response?.data?.error || "Invalid coupon code");
      setCouponApplied(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="relative pt-24">
        {/* Header */}
        <section className="relative py-16 text-center overflow-hidden">
          <div className="glow-orb glow-orb-purple absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 opacity-40" />
          <div className="relative z-10 mx-auto max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
                <ShoppingBag className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Discord Role Shop</span>
              </div>
              <h1 className="font-display text-4xl font-black text-white md:text-6xl">
                Upgrade Your <span className="gradient-text">Discord</span> Experience
              </h1>
              <p className="mt-4 text-lg text-white/60">
                Purchase exclusive Discord roles and unlock premium features in our community.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
          {/* Top 10 Best Selling */}
          {topSelling.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20">
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <h2 className="font-display text-xl font-bold text-white">🔥 Top Selling Roles</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {topSelling.slice(0, 10).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-shrink-0 w-48 glass-card neon-border p-4 text-center hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Crown className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-400">#{i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                    <p className="text-xs text-purple-400 mt-1">฿{(product.price / 100).toFixed(0)}</p>
                    <p className="text-xs text-white/40 mt-1">{product.soldCount} sold</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Coupon Section */}
          <section className="mb-8">
            <div className="glass-card neon-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Tag className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div className="flex flex-1 gap-2 w-full">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code..."
                  className="form-input flex-1 text-sm py-2"
                />
                <button
                  onClick={applyCoupon}
                  className="btn-glow text-sm text-white px-4 py-2 whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <span className="text-sm text-green-400">
                  ✓ {couponApplied.type === "PERCENTAGE" ? `${couponApplied.discount}% off` : `฿${(couponApplied.discount / 100).toFixed(0)} off`}
                </span>
              )}
              {couponError && <span className="text-sm text-red-400">{couponError}</span>}
            </div>
          </section>

          {/* Filters */}
          <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="form-input pl-10 text-sm"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-purple-600 text-white"
                    : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-purple-600 text-white"
                      : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input w-auto text-sm py-2 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0d0920]">
                  {opt.label}
                </option>
              ))}
            </select>
          </section>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-4">
                  <div className="skeleton h-40 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-white/20 mb-4" />
              <h3 className="font-display text-xl font-bold text-white/60">No products found</h3>
              <p className="text-white/40 mt-2">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    user={user}
                    appliedCoupon={couponApplied}
                    couponCode={couponCode}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Login prompt */}
          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 glass-card neon-border p-8 text-center"
            >
              <Zap className="mx-auto h-12 w-12 text-purple-400 mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">Ready to Purchase?</h3>
              <p className="text-white/60 mb-6">Login with Discord to buy roles and unlock exclusive features.</p>
              <a
                href="/api/auth/discord"
                className="btn-glow inline-flex items-center gap-2 text-white font-semibold"
              >
                Login with Discord
              </a>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
