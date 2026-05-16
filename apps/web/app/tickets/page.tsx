"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Ticket, Plus, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Upload, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface TicketItem {
  id: string;
  ticketNumber: number;
  category: string;
  subject: string;
  message: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "FAILED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
  replies: Array<{ id: string; message: string; isAdmin: boolean; createdAt: string; user: { username: string } }>;
}

const CATEGORIES = [
  "General Support",
  "Payment Issues",
  "Role Issues",
  "Verification Problems",
  "Bug Report",
  "Account Issue",
  "Other",
];

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: Clock, className: "badge-yellow" },
  IN_PROGRESS: { label: "In Progress", icon: AlertCircle, className: "badge-purple" },
  RESOLVED: { label: "Resolved", icon: CheckCircle, className: "badge-green" },
  FAILED: { label: "Failed", icon: XCircle, className: "badge-red" },
  CLOSED: { label: "Closed", icon: XCircle, className: "badge-red" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "text-blue-400" },
  MEDIUM: { label: "Medium", color: "text-yellow-400" },
  HIGH: { label: "High", color: "text-orange-400" },
  URGENT: { label: "Urgent", color: "text-red-400" },
};

export default function TicketsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    category: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/tickets");
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.subject || !form.message) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const formData = new FormData();
      formData.append("category", form.category);
      formData.append("subject", form.subject);
      formData.append("message", form.message);
      if (screenshotFile) formData.append("screenshot", screenshotFile);
      await axios.post("/api/tickets", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setShowForm(false);
      setForm({ category: "", subject: "", message: "" });
      setScreenshotFile(null);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
                <Ticket className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Support Tickets</span>
              </div>
              <h1 className="font-display text-4xl font-black text-white">
                My <span className="gradient-text">Tickets</span>
              </h1>
              <p className="mt-2 text-white/60">Track your support requests and communicate with admins.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="btn-glow flex items-center gap-2 text-white font-semibold"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </motion.button>
          </div>
        </motion.div>

        {/* New Ticket Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="glass-card neon-border p-6">
                <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-400" />
                  Create New Ticket
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/80">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="form-input cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#0d0920]">Select a category...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0d0920]">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/80">Subject *</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="form-input"
                      placeholder="Brief description of your issue..."
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/80">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="form-input min-h-32 resize-none"
                      placeholder="Describe your issue in detail..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-white/80">Screenshot (Optional)</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-white/20 p-4 transition-colors hover:border-purple-500/50">
                      <Upload className="h-5 w-5 text-white/40" />
                      <div>
                        <p className="text-sm text-white/60">
                          {screenshotFile ? screenshotFile.name : "Attach a screenshot"}
                        </p>
                        <p className="text-xs text-white/30">PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-glow flex items-center gap-2 px-6 py-3 text-white font-semibold"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                      Submit Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tickets List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 space-y-3">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center">
            <Ticket className="mx-auto h-16 w-16 text-white/20 mb-4" />
            <h3 className="font-display text-xl font-bold text-white/60">No tickets yet</h3>
            <p className="text-white/40 mt-2">Create your first support ticket to get help from our team.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, i) => {
              const statusConfig = STATUS_CONFIG[ticket.status];
              const StatusIcon = statusConfig.icon;
              const priorityConfig = PRIORITY_CONFIG[ticket.priority];
              const isExpanded = expandedTicket === ticket.id;

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card neon-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    className="w-full p-5 flex items-start justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-white/40">#{ticket.ticketNumber}</span>
                        <span className={statusConfig.className + " flex items-center gap-1"}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        <span className={`text-xs font-medium ${priorityConfig.color}`}>
                          {priorityConfig.label}
                        </span>
                        <span className="text-xs text-white/40">{ticket.category}</span>
                      </div>
                      <h3 className="font-semibold text-white">{ticket.subject}</h3>
                      <p className="mt-1 text-xs text-white/40">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        {ticket.replies.length > 0 && ` • ${ticket.replies.length} replies`}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-white/40 flex-shrink-0 mt-0.5 ml-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/10 p-5 space-y-4">
                          <div className="rounded-xl bg-white/5 p-4 text-sm text-white/70 leading-relaxed">
                            {ticket.message}
                          </div>

                          {ticket.replies.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Replies</p>
                              {ticket.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className={`flex gap-3 ${reply.isAdmin ? "flex-row" : "flex-row-reverse"}`}
                                >
                                  <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                                    reply.isAdmin ? "bg-purple-500/30 text-purple-300" : "bg-white/10 text-white"
                                  }`}>
                                    {reply.isAdmin ? "A" : "U"}
                                  </div>
                                  <div className={`flex-1 rounded-xl p-3 text-sm ${
                                    reply.isAdmin ? "bg-purple-500/10 border border-purple-500/30" : "bg-white/5"
                                  }`}>
                                    <p className={`text-xs font-medium mb-1 ${reply.isAdmin ? "text-purple-300" : "text-white/60"}`}>
                                      {reply.isAdmin ? "Admin" : reply.user.username}
                                    </p>
                                    <p className="text-white/70">{reply.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
