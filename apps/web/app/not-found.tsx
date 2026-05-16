"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="glow-orb glow-orb-purple absolute top-1/4 left-1/4 h-96 w-96 opacity-20" />
      <div className="glow-orb glow-orb-blue absolute bottom-1/4 right-1/4 h-64 w-64 opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-md"
      >
        {/* 404 display */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <h1 className="font-display text-[10rem] font-black leading-none gradient-text neon-text">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            Page Not Found
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Maybe you wandered into the wrong Discord channel?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="btn-glow flex items-center justify-center gap-2 text-white font-semibold py-3 px-6"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 px-6 text-white hover:bg-white/10 transition-all"
            >
              <Search className="h-4 w-4" />
              Browse Shop
            </Link>
          </div>
        </motion.div>

        {/* Floating decorations */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-8 -right-8 text-5xl opacity-20"
        >
          🎮
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -left-8 text-4xl opacity-20"
        >
          👾
        </motion.div>
      </motion.div>
    </div>
  );
}
