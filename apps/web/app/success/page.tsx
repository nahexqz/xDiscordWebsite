"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Crown, Home, ShoppingBag, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import axios from "axios";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/by-session?session_id=${sessionId}`);
      setOrder(res.data.order);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 pt-24 pb-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="glass-card neon-border w-full max-w-md p-10 text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CheckCircle className="h-12 w-12 text-green-400" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display text-3xl font-black text-white mb-2">
              Payment <span className="gradient-text">Successful!</span>
            </h1>
            <p className="text-white/60 mb-6 leading-relaxed">
              Your purchase has been confirmed. Your Discord role will be assigned automatically.
            </p>

            {loading ? (
              <div className="flex justify-center mb-6">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : order && (
              <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold text-white">Order Details</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Product</span>
                  <span className="text-white">{order.product?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Role</span>
                  <span className="text-purple-300">{order.product?.roleName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Amount</span>
                  <span className="text-white font-bold">฿{(order.amount / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Status</span>
                  <span className="text-green-400">✓ Completed</span>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3 mb-6 text-sm text-purple-300">
              📬 Check your Discord DMs — we&apos;ve sent you a confirmation message!
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/shop" className="btn-glow flex items-center justify-center gap-2 text-white font-semibold py-3">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
              <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-white hover:bg-white/10 transition-all">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
