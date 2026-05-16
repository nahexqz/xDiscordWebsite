"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera, Shield, CheckCircle, Loader2, AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

export default function Verification3Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    if (!user) router.push("/login");
    return () => stopCamera();
  }, [user, router]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      // Prefer rear camera for document capture
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access in your browser settings."
          : "Failed to access camera. Please use a device with a camera."
      );
    }
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.95));
        stopCamera();
      }
    }, "image/jpeg", 0.95);
  };

  const retake = async () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    await startCamera();
  };

  const handleSubmit = async () => {
    if (!capturedBlob) {
      setError("Please capture your ID card photo first");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const formData = new FormData();
      formData.append("idCardImage", capturedBlob, "id-card.jpg");
      formData.append("level", "3");
      formData.append("discordUid", user?.discordId || "");
      await axios.post("/api/verification", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
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
            <h2 className="font-display text-2xl font-bold text-white mb-3">ID Card Submitted!</h2>
            <p className="text-white/60">Your ID card photo has been submitted for admin review. You&apos;ll be notified via Discord DM.</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-28">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Verification Level 3</span>
          </div>
          <h1 className="font-display text-4xl font-black text-white">
            ID Card <span className="gradient-text">Verification</span>
          </h1>
          <p className="mt-3 text-white/60">
            Capture your government-issued ID card using your device camera. File uploads are strictly prohibited.
          </p>
        </motion.div>

        <div className="mb-6 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-300/80">
            <strong className="text-red-300">Security Notice:</strong> Your ID card data is encrypted and stored securely. Only authorized admins can view submitted documents. We comply with data protection regulations.
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card neon-border overflow-hidden"
        >
          <div className="p-6">
            <div className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16/9" }}>
              {!capturedImage && (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                />
              )}

              {capturedImage && (
                <img src={capturedImage} alt="Captured ID" className="h-full w-full object-cover" />
              )}

              {!cameraReady && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
                  <CreditCard className="h-16 w-16 text-white/20" />
                  {cameraError ? (
                    <p className="max-w-xs text-center text-sm text-red-400">{cameraError}</p>
                  ) : (
                    <p className="text-sm text-white/40">Camera not started</p>
                  )}
                  <button onClick={startCamera} className="btn-glow text-sm text-white px-6 py-2">
                    <Camera className="inline h-4 w-4 mr-2" />
                    Open Camera
                  </button>
                </div>
              )}

              {/* ID Card guide overlay */}
              {cameraReady && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="border-2 border-purple-400/60 border-dashed rounded-lg"
                    style={{ width: "75%", height: "55%" }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-purple-400 whitespace-nowrap">
                      Align ID card here
                    </div>
                  </div>
                </div>
              )}

              {cameraReady && !capturedImage && (
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-white">LIVE</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <ul className="mt-4 space-y-1 text-xs text-white/50">
              <li>• Place your ID card within the dashed rectangle</li>
              <li>• Ensure all text and photo on the ID are clearly visible</li>
              <li>• Use the rear camera for best quality</li>
              <li>• Avoid glare and shadows on the card</li>
              <li>• Accepted: National ID, Passport, Driver&apos;s License</li>
            </ul>
          </div>

          <div className="border-t border-white/10 p-4 flex gap-3">
            {!capturedImage ? (
              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 text-white font-semibold disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
                Capture ID Card
              </button>
            ) : (
              <>
                <button
                  onClick={retake}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retake
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 text-white font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><CheckCircle className="h-4 w-4" />Submit ID</>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
