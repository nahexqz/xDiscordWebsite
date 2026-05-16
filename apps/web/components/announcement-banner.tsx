"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import axios from "axios";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  info:    { bg: "bg-blue-500/10",    border: "border-blue-500/30",    icon: "ℹ️" },
  warning: { bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  icon: "⚠️" },
  success: { bg: "bg-green-500/10",   border: "border-green-500/30",   icon: "✅" },
  error:   { bg: "bg-red-500/10",     border: "border-red-500/30",     icon: "🚨" },
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await axios.get("/api/announcements");
      if (!res.data.announcement) return;

      const ann = res.data.announcement;
      // Check if user dismissed this announcement within 24h
      const dismissedKey = `announcement_dismissed_${ann.id}`;
      const dismissedAt = localStorage.getItem(dismissedKey);
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt);
        if (elapsed < 24 * 60 * 60 * 1000) return; // Still within 24h
      }

      setAnnouncement(ann);
      setVisible(true);
    } catch {}
  };

  const dismiss = () => {
    if (announcement) {
      localStorage.setItem(`announcement_dismissed_${announcement.id}`, Date.now().toString());
    }
    setVisible(false);
  };

  const style = announcement ? (TYPE_STYLES[announcement.type] || TYPE_STYLES.info) : TYPE_STYLES.info;

  return (
    <AnimatePresence>
      {visible && announcement && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed left-4 right-4 top-4 z-[100] mx-auto max-w-2xl rounded-2xl border ${style.border} ${style.bg} backdrop-blur-xl p-4 shadow-2xl`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-white">{announcement.title}</p>
              <p className="mt-0.5 text-sm text-white/70 leading-relaxed">{announcement.message}</p>
            </div>
            <button
              onClick={dismiss}
              className="flex-shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
