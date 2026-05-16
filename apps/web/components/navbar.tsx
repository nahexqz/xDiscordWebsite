"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LayoutDashboard, Ticket, Shield, LogOut,
  Menu, X, Coins, ChevronDown, ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Store", href: "/shop" },
  { label: "Verification", href: "/verification" },
  { label: "Tickets", href: "/tickets" },
  { label: "Support", href: "/tickets" },
  { label: "Rules", href: "/#rules" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.webp?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-black/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/50">
              <span className="text-lg font-bold text-white">LC</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold leading-tight text-white">LEGENDARY</p>
            <p className="font-display text-xs text-purple-400 leading-tight">COMMUNITY</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`nav-link rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href ? "active" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:bg-white/10"
                  >
                    <Image
                      src={avatarUrl}
                      alt={user.username}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <span className="hidden text-sm font-medium text-white sm:block">
                      {user.username}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl"
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        {/* User Info */}
                        <div className="border-b border-white/10 px-4 py-3">
                          <p className="text-sm font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-white/50">{user.email}</p>
                          {user.wallet && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                              <Coins className="h-3 w-3" />
                              <span>{(user.wallet.balance / 100).toFixed(2)} THB Credits</span>
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          {[
                            { icon: User, label: "My Profile", href: "/profile" },
                            { icon: LayoutDashboard, label: "Dashboard", href: user.isAdmin ? "/dashboard/admin" : "/profile" },
                            { icon: Ticket, label: "My Tickets", href: "/tickets" },
                            { icon: Shield, label: "Verification", href: "/verification" },
                          ].map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          ))}

                          <hr className="my-2 border-white/10" />

                          <button
                            onClick={() => { setDropdownOpen(false); logout(); }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  href="/api/auth/discord"
                  className="btn-glow flex items-center gap-2 text-sm text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>JOIN DISCORD</span>
                </a>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
