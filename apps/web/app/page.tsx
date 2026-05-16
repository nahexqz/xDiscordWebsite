"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  Users, Zap, Music, Gift, ShoppingBag, Headphones,
  Calendar, Shield, ChevronRight, Star, ArrowRight,
  MessageSquare, Hash, Volume2, Settings,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

// ─── Floating Particles ──────────────────────────────────────────────────────
function Particles() {
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    setMounted(true);
    setViewportHeight(window.innerHeight);
  }, []);

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 15 + 10,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: "-10px",
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -viewportHeight - 100],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Discord Mockup ───────────────────────────────────────────────────────────
function DiscordMockup() {
  const channels = ["📢 announcements", "💬 general", "🎮 gaming", "🎵 music", "🎁 giveaways", "🛒 marketplace"];
  const messages = [
    { user: "LegendaryBot", avatar: "🤖", color: "#9333ea", text: "🎉 Welcome to Legendary Community!", time: "Today at 12:00" },
    { user: "GamerKing", avatar: "👑", color: "#f59e0b", text: "Just got my Level 2 verification! This community is amazing 🔥", time: "Today at 12:05" },
    { user: "NightOwl", avatar: "🦉", color: "#3b82f6", text: "Anyone up for gaming tonight?", time: "Today at 12:10" },
    { user: "StarPlayer", avatar: "⭐", color: "#10b981", text: "The new roles from the shop are insane! 💜", time: "Today at 12:15" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="discord-mockup w-full max-w-lg shadow-2xl"
      style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 80px rgba(147,51,234,0.3)" }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 bg-[#1e1f22] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-white/30">Legendary Community</span>
      </div>

      <div className="flex h-80">
        {/* Server sidebar */}
        <div className="flex w-14 flex-col items-center gap-2 bg-[#1e1f22] py-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-xs font-bold text-white hover:rounded-xl transition-all cursor-pointer">
            LC
          </div>
          <div className="h-px w-8 bg-white/10" />
          {["🎮", "🎵", "⭐"].map((emoji, i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-[#36393f] flex items-center justify-center text-sm cursor-pointer hover:rounded-xl hover:bg-[#5865f2] transition-all">
              {emoji}
            </div>
          ))}
        </div>

        {/* Channel sidebar */}
        <div className="discord-sidebar flex flex-col py-3">
          <div className="px-3 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Legendary Community</p>
          </div>
          <div className="space-y-0.5 px-2">
            {channels.map((ch, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-1 text-xs cursor-pointer",
                  i === 1 ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
                )}
              >
                <Hash className="h-3 w-3" />
                <span>{ch.replace(/[^\w\s-]/g, "")}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 px-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40 px-2 mb-1">Voice</div>
            <div className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-white/40 cursor-pointer hover:bg-white/5">
              <Volume2 className="h-3 w-3" />
              <span>Music Room</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="discord-channel flex flex-1 flex-col">
          <div className="border-b border-black/30 flex items-center gap-2 px-4 py-2">
            <Hash className="h-4 w-4 text-white/40" />
            <span className="text-sm font-semibold text-white">general</span>
          </div>
          <div className="flex-1 overflow-hidden p-3 space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="flex gap-2"
              >
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[#2b2d31] flex items-center justify-center text-sm">
                  {msg.avatar}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold" style={{ color: msg.color }}>{msg.user}</span>
                    <span className="text-[10px] text-white/30">{msg.time}</span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Input */}
          <div className="m-3 rounded-lg bg-[#383a40] px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-white/30 flex-1">Message #general</span>
            <Settings className="h-3.5 w-3.5 text-white/30" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────
const STATS = [
  { label: "Members", value: "1,500+", icon: Users, color: "from-purple-500 to-purple-700" },
  { label: "Online Users", value: "820+", icon: Zap, color: "from-blue-500 to-blue-700" },
  { label: "Active Rooms", value: "45", icon: Volume2, color: "from-green-500 to-green-700" },
  { label: "Events", value: "10/Month", icon: Calendar, color: "from-orange-500 to-orange-700" },
];

// ─── Featured Cards ───────────────────────────────────────────────────────────
const FEATURED = [
  {
    icon: Gift,
    title: "Nitro Giveaway",
    desc: "Animated giveaway systems and community events.",
    color: "from-pink-500 to-rose-600",
    gradient: "rgba(236,72,153,0.15)",
    size: "large",
  },
  {
    icon: Music,
    title: "Music Rooms",
    desc: "Animated voice activities and hover-expand effects.",
    color: "from-blue-500 to-cyan-600",
    gradient: "rgba(59,130,246,0.15)",
    size: "small",
  },
  {
    icon: Calendar,
    title: "Weekly Events",
    desc: "Highlight current festives, animated calendar and hover-expand effects.",
    color: "from-orange-500 to-yellow-600",
    gradient: "rgba(249,115,22,0.15)",
    size: "large",
  },
  {
    icon: ShoppingBag,
    title: "Max Marketplace",
    desc: "Highlight features, role selections, and hover-expand effects.",
    color: "from-purple-500 to-indigo-600",
    gradient: "rgba(147,51,234,0.15)",
    size: "small",
  },
  {
    icon: Headphones,
    title: "Support System",
    desc: "Support system announce animated effects.",
    color: "from-teal-500 to-emerald-600",
    gradient: "rgba(20,184,166,0.15)",
    size: "small",
  },
];

// ─── Community Cards ──────────────────────────────────────────────────────────
const COMMUNITY_CARDS = [
  {
    title: "About Us",
    desc: "Our community topics are can use community and cenomincoting.",
    points: ["Chatting with a chatting, gaming, making friends.", "Meeting friends, meeting, meeting quality society."],
    emoji: "👥",
    gradient: "from-purple-500/20 to-purple-900/5",
  },
  {
    title: "Why Join?",
    desc: "Modernī canis cardo to simplatin the community for a garawere activities.",
    points: ["Nitro giveaways", "Level Systems", "Level System", "Events awards", "Server Bots", "Server Tools tool..."],
    emoji: "🏆",
    gradient: "from-yellow-500/20 to-yellow-900/5",
  },
  {
    title: "Our Features",
    desc: "Our customorizodixias on bards and community topics.",
    points: ["Events Events", "Moderation and customisíolions", "Moderation and sean-bots", "Role Customization", "Verification", "Bots"],
    emoji: "⚙️",
    gradient: "from-blue-500/20 to-blue-900/5",
  },
];

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Mouse glow effect */}
      <div
        className="pointer-events-none fixed z-10 transition-opacity duration-300"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <Navbar />

      {/* ─── HERO SECTION ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background glows */}
        <div className="glow-orb glow-orb-purple absolute -top-32 -left-32 h-[500px] w-[500px] opacity-60" />
        <div className="glow-orb glow-orb-blue absolute top-1/2 right-0 h-[400px] w-[400px] opacity-40" />
        <div className="glow-orb glow-orb-purple absolute bottom-0 left-1/2 h-[300px] w-[300px] opacity-30" />

        <Particles />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left content */}
            <motion.div style={{ y: heroY }} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
                  <span className="text-xs font-medium text-purple-300">820+ Members Online Now</span>
                </div>

                <h1 className="font-display text-5xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
                  WELCOME TO
                  <br />
                  OUR{" "}
                  <span className="gradient-text neon-text">DISCORD</span>
                  <br />
                  COMMUNITY
                </h1>

                <p className="mt-4 max-w-md text-lg text-white/60 leading-relaxed">
                  A Legendary Community is a community for talking, gaming, making friends, activities, and join a high-quality society.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_INVITE || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glow flex items-center gap-2 text-white font-semibold"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.083.117 18.108.137 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  JOIN DISCORD
                </a>

                <Link
                  href="/verification"
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 hover:border-white/40"
                >
                  GET STARTED
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-6 pt-4"
              >
                {[
                  { label: "Members", val: "1,500+" },
                  { label: "Online", val: "820+" },
                  { label: "Events/mo", val: "10+" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display text-2xl font-bold gradient-text">{s.val}</p>
                    <p className="text-xs text-white/40">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Discord mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center"
            >
              <DiscordMockup />
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z"
              fill="rgba(7,7,15,0.8)"
            />
          </svg>
        </div>
      </section>

      {/* ─── STATISTICS ──────────────────────────────────────── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Server <span className="gradient-text">Statistics</span>
            </h2>
            <p className="mt-3 text-white/50">Real-time data from our growing community</p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="stat-card cursor-default"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-display text-3xl font-black gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED CONTENT ─────────────────────────────────── */}
      <section className="relative py-20">
        <div className="glow-orb glow-orb-purple absolute right-0 top-0 h-96 w-96 opacity-20" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Featured <span className="gradient-text">Content</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Large weekly events card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="col-span-2 row-span-2 glass-card neon-border overflow-hidden p-6 cursor-pointer"
              style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0.4) 100%)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                  <Calendar className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white">Weekly Events</h3>
                  <p className="text-xs text-white/50">Highlight current festives</p>
                </div>
              </div>
              <p className="text-sm text-white/60">
                Animated calendar and hover-expand effects. Join us every week for exciting events, giveaways, and community activities.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Gaming Tournament", "Nitro Giveaway", "Movie Night", "Music Sessions"].map((tag) => (
                  <span key={tag} className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Other featured cards */}
            {FEATURED.filter((_, i) => i > 0).map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card neon-border overflow-hidden p-5 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${card.gradient} 0%, rgba(0,0,0,0.4) 100%)` }}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-sm font-bold text-white">{card.title}</h3>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY SECTION ────────────────────────────────── */}
      <section className="relative py-20">
        <div className="glow-orb glow-orb-blue absolute -left-32 bottom-0 h-96 w-96 opacity-20" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {COMMUNITY_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`glass-card neon-border p-6 bg-gradient-to-br ${card.gradient}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">{card.emoji}</span>
                  <h3 className="font-display text-lg font-bold text-white">{card.title}</h3>
                </div>
                <p className="mb-4 text-sm text-white/60">{card.desc}</p>
                <ul className="space-y-1">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-white/70">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-1"
            style={{
              background: "linear-gradient(135deg, rgba(147,51,234,0.5), rgba(59,130,246,0.3), rgba(236,72,153,0.3))",
            }}
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-purple-900/80 to-black/80 p-12 text-center backdrop-blur-sm overflow-hidden">
              <div className="glow-orb glow-orb-purple absolute -top-20 left-1/2 -translate-x-1/2 h-80 w-80 opacity-50" />
              <div className="relative z-10">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-400">
                  Call To Action Section
                </p>
                <h2 className="font-display text-4xl font-black text-white md:text-5xl">
                  READY TO JOIN OUR{" "}
                  <span className="gradient-text neon-text">COMMUNITY?</span>
                </h2>
                <p className="mt-4 text-white/60 max-w-md mx-auto">
                  Join thousands of members in our legendary community. Game, chat, make friends, and unlock exclusive roles.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <a
                    href={process.env.NEXT_PUBLIC_DISCORD_INVITE || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow flex items-center gap-2 text-white font-semibold"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.083.117 18.108.137 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                    JOIN DISCORD
                  </a>
                  <Link
                    href="/verification"
                    className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
                  >
                    START VERIFICATION
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
