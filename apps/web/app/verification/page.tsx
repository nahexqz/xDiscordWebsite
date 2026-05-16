"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Upload, Phone, AlertTriangle, CheckCircle, Loader2, Camera } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  birthDay: z.string().min(1, "Day is required"),
  birthMonth: z.string().min(1, "Month is required"),
  birthYear: z.string().min(4, "Year is required"),
  phone: z.string().min(10, "Valid phone number required"),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  otherSocialUrl: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function VerificationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<"form" | "otp" | "upload" | "submitting" | "done">("form");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current && recaptchaRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "invisible",
        callback: () => {},
      });
    }
  };

  const sendOTP = async () => {
    const phone = watch("phone");
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    try {
      setSending(true);
      setError("");
      setupRecaptcha();
      const phoneNumber = phone.startsWith("+") ? phone : `+66${phone.replace(/^0/, "")}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current!);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!confirmationResult || otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP code");
      return;
    }
    try {
      setVerifying(true);
      setError("");
      await confirmationResult.confirm(otpCode);
      setPhoneVerified(true);
    } catch (err: any) {
      setError("Invalid OTP code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    if (!phoneVerified) {
      setError("Please verify your phone number first");
      return;
    }
    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      formData.append("birthdate", `${data.birthYear}-${data.birthMonth.padStart(2, "0")}-${data.birthDay.padStart(2, "0")}`);
      formData.append("discordUid", user?.discordId || "");
      formData.append("email", user?.email || "");
      formData.append("level", "1");
      if (screenshotFile) {
        formData.append("profileScreenshot", screenshotFile);
      }

      await axios.post("/api/verification", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStep("done");
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 10 - i);

  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4 pt-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card neon-border p-12 text-center max-w-md"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">Submitted Successfully!</h2>
            <p className="text-white/60 leading-relaxed mb-6">
              Your verification request has been submitted. An admin will review your information and you&apos;ll receive a Discord DM with the result.
            </p>
            <div className="space-y-2">
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3 text-sm text-purple-300">
                📬 Check your Discord DMs for updates
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Verification Level 1</span>
          </div>
          <h1 className="font-display text-4xl font-black text-white">
            Identity <span className="gradient-text">Verification</span>
          </h1>
          <p className="mt-3 text-white/60">
            Complete verification to unlock exclusive features and roles in our community.
          </p>
        </motion.div>

        {/* Level indicators */}
        <div className="mb-8 flex justify-center gap-4">
          {[
            { level: 1, label: "Basic", active: true },
            { level: 2, label: "Selfie", active: false },
            { level: 3, label: "ID Card", active: false },
          ].map((item) => (
            <div
              key={item.level}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                item.active
                  ? "bg-purple-600 text-white"
                  : "border border-white/10 bg-white/5 text-white/40"
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                item.active ? "bg-white text-purple-700" : "bg-white/10 text-white/40"
              }`}>
                {item.level}
              </div>
              {item.label}
            </div>
          ))}
        </div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">Important Notice</p>
            <p className="text-xs text-yellow-300/70 mt-1">
              Users must provide real and accurate information. Fake information or impersonation of others is strictly prohibited and may result in a permanent ban.
            </p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card neon-border p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">First Name *</label>
                <input {...register("firstName")} className="form-input" placeholder="John" />
                {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Last Name *</label>
                <input {...register("lastName")} className="form-input" placeholder="Doe" />
                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Birthdate */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Date of Birth *</label>
              <div className="grid grid-cols-3 gap-3">
                <select {...register("birthDay")} className="form-input cursor-pointer" defaultValue="">
                  <option value="" disabled>Day</option>
                  {days.map((d) => <option key={d} value={d} className="bg-[#0d0920]">{d}</option>)}
                </select>
                <select {...register("birthMonth")} className="form-input cursor-pointer" defaultValue="">
                  <option value="" disabled>Month</option>
                  {months.map((m, i) => <option key={m} value={i + 1} className="bg-[#0d0920]">{m}</option>)}
                </select>
                <select {...register("birthYear")} className="form-input cursor-pointer" defaultValue="">
                  <option value="" disabled>Year</option>
                  {years.map((y) => <option key={y} value={y} className="bg-[#0d0920]">{y}</option>)}
                </select>
              </div>
            </div>

            {/* Discord fields (auto-filled, readonly) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Discord UID</label>
                <div className="relative">
                  <input
                    value={user?.discordId || ""}
                    readOnly
                    className="form-input bg-white/3 cursor-not-allowed opacity-60"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="badge-purple text-xs">Auto-filled</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Email</label>
                <div className="relative">
                  <input
                    value={user?.email || ""}
                    readOnly
                    className="form-input bg-white/3 cursor-not-allowed opacity-60"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="badge-purple text-xs">Auto-filled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="mb-3 block text-sm font-medium text-white/80">Social Media Links (Optional)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-sm text-white/50 flex-shrink-0">Facebook</span>
                  <input {...register("facebookUrl")} className="form-input text-sm" placeholder="https://facebook.com/..." />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-sm text-white/50 flex-shrink-0">Instagram</span>
                  <input {...register("instagramUrl")} className="form-input text-sm" placeholder="https://instagram.com/..." />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-sm text-white/50 flex-shrink-0">Other</span>
                  <input {...register("otherSocialUrl")} className="form-input text-sm" placeholder="Other social link..." />
                </div>
              </div>
            </div>

            {/* Phone + OTP */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Phone Number *</label>
              <div className="flex gap-2">
                <input
                  {...register("phone")}
                  type="tel"
                  className="form-input flex-1"
                  placeholder="+66 or 08x-xxx-xxxx"
                />
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={sending || otpSent}
                  className={`flex-shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    otpSent
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "btn-glow text-white"
                  }`}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : otpSent ? (
                    "✓ Sent"
                  ) : (
                    <><Phone className="inline h-4 w-4 mr-1" />Send OTP</>
                  )}
                </button>
              </div>

              {/* OTP Input */}
              {otpSent && !phoneVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="form-input flex-1 text-center tracking-widest text-lg"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={verifyOTP}
                    disabled={verifying || otpCode.length !== 6}
                    className="btn-glow flex-shrink-0 px-4 text-sm text-white"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                  </button>
                </motion.div>
              )}

              {phoneVerified && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  Phone number verified!
                </div>
              )}
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Discord Profile Screenshot
              </label>
              <p className="mb-3 text-xs text-white/40">
                Upload a screenshot showing your Discord profile with username and discriminator visible.
              </p>
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-white/20 p-6 transition-colors hover:border-purple-500/50 hover:bg-purple-500/5">
                <Upload className="h-8 w-8 text-white/30" />
                <span className="text-sm text-white/50">Click to upload or drag & drop</span>
                <span className="text-xs text-white/30">PNG, JPG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotUpload}
                />
              </label>
              {screenshotPreview && (
                <div className="mt-3">
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    className="h-32 w-auto rounded-lg object-cover border border-white/10"
                  />
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !phoneVerified}
              className="btn-glow w-full py-4 text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Submit Verification
                </>
              )}
            </button>

            {!phoneVerified && (
              <p className="text-center text-xs text-white/40">
                You must verify your phone number before submitting.
              </p>
            )}
          </form>
        </motion.div>
      </div>

      {/* Invisible Recaptcha */}
      <div ref={recaptchaRef} id="recaptcha-container" />

      <Footer />
    </div>
  );
}
