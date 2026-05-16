"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { XCircle, ShoppingBag, Home, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function CancelPage() {
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
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="font-display text-3xl font-black text-white mb-2">Payment Cancelled</h1>
          <p className="text-white/60 mb-8 leading-relaxed">
            Your payment was cancelled. No charges were made to your account. You can try again whenever you&apos;re ready.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/shop" className="btn-glow flex items-center justify-center gap-2 text-white font-semibold py-3">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-white hover:bg-white/10 transition-all">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
