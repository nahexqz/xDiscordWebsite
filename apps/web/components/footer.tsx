"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Youtube, Twitter, MessageCircle } from "lucide-react";

const FOOTER_LINKS = {
  "Useful Links": [
    { label: "Home", href: "/" },
    { label: "Store", href: "/shop" },
    { label: "Verification", href: "/verification" },
    { label: "Support", href: "/tickets" },
    { label: "Updates", href: "/#" },
    { label: "Team", href: "/#" },
  ],
  "Help Sections": [
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Support", href: "/tickets" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: process.env.NEXT_PUBLIC_DISCORD_INVITE || "#", label: "Discord" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden">
        <div className="glow-orb glow-orb-purple h-64 w-64 -bottom-32 -left-32 opacity-20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/50">
                  <span className="text-lg font-bold text-white">LC</span>
                </div>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-white">LEGENDARY</p>
                <p className="font-display text-xs text-purple-400">COMMUNITY</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Unleash your potential. Talk, game, make online friends, activities, and join a high-quality society.
            </p>
            <div className="flex gap-3 mt-6">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-purple-500/50 hover:text-purple-400"
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-semibold text-white">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-purple-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-purple-400">
                <MessageCircle className="h-4 w-4" />
                Discord Server
              </a>
              <a href="mailto:support@legendarycommunity.com" className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-purple-400">
                <span>✉</span>
                support@legendary.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-white/30">
            Copyright © 2025 Legendary Community. All rights reserved. Not affiliated with Discord.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
