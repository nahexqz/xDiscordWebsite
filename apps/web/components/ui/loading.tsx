"use client";

import { motion } from "framer-motion";

export function PageLoading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#07070f]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 p-0.5"
        >
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#07070f]">
            <span className="font-display text-2xl font-black text-white">LC</span>
          </div>
        </motion.div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <p className="text-sm text-white/40">Loading Legendary Community...</p>
      </motion.div>
    </div>
  );
}

export function SpinnerLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} rounded-full border-2 border-purple-500/30 border-t-purple-500`}
      />
    </div>
  );
}
