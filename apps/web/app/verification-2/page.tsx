"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera, Shield, CheckCircle, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/store/auth-store";
import axios from "axios";

export default function Verification2Page() {
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
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
          : "Failed to access camera. Please ensure your device has a camera."
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
    // Mirror the image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  const retake = async () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    await startCamera();
  };

  const handleSubmit = async () => {
    if (!capturedBlob) {
      setError("Please capture a photo first");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const formData = new FormData();
      formData.append("selfieImage", capturedBlob, "selfie.jpg");
      formData.append("level", "2");
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
            <h2 className="font-display text-2xl font-bold text-white mb-3">Selfie Submitted!</h2>
            <p className="text-white/60">Your selfie has been sent for admin review. Check your Discord DMs for updates.</p>
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
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Verification Level 2</span>
          </div>
          <h1 className="font-display text-4xl font-black text-white">
            Selfie <span className="gradient-text">Verification</span>
          </h1>
          <p className="mt-3 text-white/60">
            Take a live selfie using your device camera. File uploads are not allowed for security reasons.
          </p>
        </motion.div>

        {/* Warning */}
        <div className="mb-6 flex gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300/80">
            <strong className="text-yellow-300">Important:</strong> You must use your device camera to capture a live photo. Image file uploads are strictly prohibited.
          </div>
        </div>

        {/* Camera Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card neon-border overflow-hidden"
        >
          <div className="p-6">
            <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
              {/* Video stream */}
              {!capturedImage && (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                  muted
                />
              )}

              {/* Captured photo */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured selfie"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Camera not started overlay */}
              {!cameraReady && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
                  <Camera className="h-16 w-16 text-white/20" />
                  {cameraError ? (
                    <div className="max-w-xs text-center">
                      <p className="text-sm text-red-400">{cameraError}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">Camera not started</p>
                  )}
                  <button
                    onClick={startCamera}
                    className="btn-glow text-sm text-white px-6 py-2"
                  >
                    <Camera className="inline h-4 w-4 mr-2" />
                    Open Camera
                  </button>
                </div>
              )}

              {/* Face guide overlay */}
              {cameraReady && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-52 w-40 rounded-full border-2 border-purple-400/60 border-dashed" />
                </div>
              )}

              {/* Camera ready indicator */}
              {cameraReady && !capturedImage && (
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-white">LIVE</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Instructions */}
            <ul className="mt-4 space-y-1 text-xs text-white/50">
              <li>• Position your face within the oval guide</li>
              <li>• Ensure good lighting and your face is clearly visible</li>
              <li>• Look directly at the camera</li>
              <li>• Remove sunglasses or face coverings</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="border-t border-white/10 p-4 flex gap-3">
            {!capturedImage ? (
              <button
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="btn-glow flex-1 flex items-center justify-center gap-2 py-3 text-white font-semibold disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
                Capture Photo
              </button>
            ) : (
              <>
                <button
                  onClick={retake}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
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
                    <><CheckCircle className="h-4 w-4" />Submit</>
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
