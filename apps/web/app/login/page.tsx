"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Shield, Zap, Crown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const ERROR_MESSAGES: Record<string, string> = {
    access_denied: "You denied Discord access. Please try again.",
    auth_failed: "Authentication failed. Please try again.",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-4 pt-24 pb-20">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card neon-border p-10 text-center"
          >
            {/* Logo */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800">
              <Crown className="h-10 w-10 text-white" />
            </div>

            <h1 className="font-display text-3xl font-black text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-white/60 mb-8">
              Sign in with your Discord account to access the community.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {ERROR_MESSAGES[error] || "An error occurred. Please try again."}
              </motion.div>
            )}

            {/* Discord Login Button */}
            <a
              href="/api/auth/discord"
              className="btn-glow w-full flex items-center justify-center gap-3 py-4 text-white font-semibold text-lg mb-6"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.083.117 18.108.137 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Continue with Discord
            </a>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Secure OAuth2" },
                { icon: Zap, label: "Instant Access" },
                { icon: Crown, label: "Exclusive Roles" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <item.icon className="mx-auto h-5 w-5 text-purple-400 mb-1" />
                  <p className="text-xs text-white/50">{item.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-white/30 leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
