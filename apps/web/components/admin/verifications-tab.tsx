"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Shield, Check, X, Eye, Loader2, ChevronDown } from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface Verification {
  id: string;
  level: number;
  status: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  phone: string;
  email: string;
  discordUid: string;
  facebookUrl?: string;
  instagramUrl?: string;
  profileScreenshot?: string;
  selfieImage?: string;
  idCardImage?: string;
  createdAt: string;
  user: { username: string; avatar?: string; discordId: string };
}

export function AdminVerificationsTab() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  useEffect(() => { fetchVerifications(); }, [selectedLevel]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/verifications", {
        params: { status: "PENDING", level: selectedLevel !== "all" ? selectedLevel : undefined },
      });
      setVerifications(res.data.verifications || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id);
      await axios.post(`/api/admin/verifications/${id}/approve`);
      setVerifications((v) => v.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to approve");
    } finally { setProcessing(null); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { alert("Please provide a rejection reason"); return; }
    try {
      setProcessing(id);
      await axios.post(`/api/admin/verifications/${id}/reject`, { reason: rejectReason });
      setVerifications((v) => v.filter((x) => x.id !== id));
      setShowRejectInput(null);
      setRejectReason("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reject");
    } finally { setProcessing(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-400" />
          Verification Queue
        </h2>
        <div className="flex gap-2">
          {["all", "1", "2", "3"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                selectedLevel === lvl ? "bg-purple-600 text-white" : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {lvl === "all" ? "All" : `Level ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : verifications.length === 0 ? (
        <div className="py-20 text-center">
          <Shield className="mx-auto h-16 w-16 text-white/20 mb-4" />
          <p className="text-white/50">No pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card neon-border overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-purple-500/20">
                    {v.user.avatar ? (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${v.user.discordId}/${v.user.avatar}.webp?size=64`}
                        alt={v.user.username}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-purple-300">
                        {v.user.username[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{v.firstName} {v.lastName}</p>
                    <p className="text-xs text-white/40">@{v.user.username} • Level {v.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">
                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded === v.id ? "rotate-180" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleApprove(v.id)}
                    disabled={processing === v.id}
                    className="flex items-center gap-1.5 rounded-xl bg-green-500/20 border border-green-500/30 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    {processing === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectInput(showRejectInput === v.id ? null : v.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Reject reason input */}
              {showRejectInput === v.id && (
                <div className="border-t border-white/10 p-4 flex gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="form-input flex-1 text-sm py-2"
                  />
                  <button
                    onClick={() => handleReject(v.id)}
                    disabled={processing === v.id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                  </button>
                </div>
              )}

              {/* Expanded details */}
              {expanded === v.id && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                    {[
                      { label: "Discord UID", value: v.discordUid },
                      { label: "Email", value: v.email },
                      { label: "Phone", value: v.phone },
                      { label: "Birthdate", value: v.birthdate?.slice(0, 10) },
                      { label: "Facebook", value: v.facebookUrl || "—" },
                      { label: "Instagram", value: v.instagramUrl || "—" },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-xs text-white/40">{field.label}</p>
                        <p className="text-white truncate">{field.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Images */}
                  <div className="flex flex-wrap gap-4">
                    {v.profileScreenshot && (
                      <div>
                        <p className="text-xs text-white/40 mb-2">Discord Screenshot</p>
                        <a href={v.profileScreenshot} target="_blank" rel="noopener noreferrer">
                          <img src={v.profileScreenshot} alt="Profile" className="h-32 w-auto rounded-lg border border-white/10 hover:opacity-80 transition-opacity" />
                        </a>
                      </div>
                    )}
                    {v.selfieImage && (
                      <div>
                        <p className="text-xs text-white/40 mb-2">Selfie</p>
                        <a href={v.selfieImage} target="_blank" rel="noopener noreferrer">
                          <img src={v.selfieImage} alt="Selfie" className="h-32 w-auto rounded-lg border border-white/10 hover:opacity-80 transition-opacity" />
                        </a>
                      </div>
                    )}
                    {v.idCardImage && (
                      <div>
                        <p className="text-xs text-white/40 mb-2">ID Card</p>
                        <a href={v.idCardImage} target="_blank" rel="noopener noreferrer">
                          <img src={v.idCardImage} alt="ID Card" className="h-32 w-auto rounded-lg border border-white/10 hover:opacity-80 transition-opacity" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
