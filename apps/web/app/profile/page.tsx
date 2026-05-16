"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, Shield, Coins, ShoppingBag, Clock, Crown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";
import { formatDistanceToNow, format } from "date-fns";

interface ProfileData {
  user: {
    id: string;
    discordId: string;
    username: string;
    email?: string;
    avatar?: string;
    createdAt: string;
    wallet?: { balance: number };
  };
  orders: Array<{
    id: string;
    product: { name: string; roleName: string };
    amount: number;
    status: string;
    createdAt: string;
  }>;
  verification?: { level: number; status: string } | null;
  discordCreatedAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl px-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user?.discordId}/${user?.avatar}.webp?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  // Calculate Discord account age
  const discordCreatedAt = profile?.discordCreatedAt
    ? new Date(profile.discordCreatedAt)
    : (() => {
        // Snowflake to timestamp
        const snowflake = BigInt(user?.discordId || "0");
        const timestamp = Number((snowflake >> BigInt(22)) + BigInt(1420070400000));
        return new Date(timestamp);
      })();

  const accountAgeDays = Math.floor((Date.now() - discordCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

  const STATUS_COLORS: Record<string, string> = {
    COMPLETED: "badge-green",
    PENDING: "badge-yellow",
    FAILED: "badge-red",
    REFUNDED: "badge-purple",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-28">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="glass-card neon-border p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-purple-500/40">
                  <Image src={avatarUrl} alt={user?.username || ""} width={96} height={96} className="h-full w-full object-cover" />
                </div>
                {profile?.verification && (
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 ring-2 ring-black">
                    <span className="text-xs font-bold text-white">{profile.verification.level}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-display text-3xl font-black text-white">{user?.username}</h1>
                <p className="font-mono text-sm text-white/40">#{user?.discordId}</p>
                {profile?.verification && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1">
                    <Shield className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-semibold text-purple-300">
                      Verified Level {profile.verification.level}
                    </span>
                  </div>
                )}
              </div>

              {/* Credits */}
              {profile?.user.wallet && (
                <div className="glass-card border border-yellow-500/20 p-4 text-center min-w-32">
                  <Coins className="mx-auto h-6 w-6 text-yellow-400 mb-1" />
                  <p className="font-display text-xl font-black text-yellow-400">
                    ฿{(profile.user.wallet.balance / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/40">Credits</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { icon: Mail, label: "Email", value: user?.email || "Not provided", truncate: true },
            { icon: Calendar, label: "Account Created", value: format(discordCreatedAt, "MMM yyyy") },
            { icon: Clock, label: "Account Age", value: `${accountAgeDays} days` },
            { icon: ShoppingBag, label: "Total Orders", value: profile?.orders.length.toString() || "0" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card neon-border p-4"
            >
              <stat.icon className="h-5 w-5 text-purple-400 mb-2" />
              <p className="text-xs text-white/40 mb-0.5">{stat.label}</p>
              <p className={`text-sm font-semibold text-white ${stat.truncate ? "truncate" : ""}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Purchase History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card neon-border overflow-hidden"
        >
          <div className="border-b border-white/10 p-5 flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-purple-400" />
            <h2 className="font-display text-lg font-bold text-white">Purchase History</h2>
          </div>

          {!profile?.orders.length ? (
            <div className="py-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-white/20 mb-3" />
              <p className="text-white/50">No purchases yet</p>
              <Link href="/shop" className="mt-4 inline-block text-sm text-purple-400 hover:text-purple-300">
                Browse the shop →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {profile?.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                      <Crown className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{order.product.name}</p>
                      <p className="text-xs text-white/40">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">฿{(order.amount / 100).toFixed(0)}</p>
                    <span className={STATUS_COLORS[order.status] || "badge-yellow"}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
