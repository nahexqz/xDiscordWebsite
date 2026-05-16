"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glow-orb glow-orb-purple absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card neon-border p-10 text-center max-w-md relative"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Something went wrong!
        </h2>
        <p className="text-white/50 mb-2 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-white/30 mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="btn-glow flex items-center justify-center gap-2 text-white font-semibold py-3 px-6"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 px-6 text-white hover:bg-white/10 transition-all"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
