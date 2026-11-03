"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isAdminEmail } from "@/lib/auth/auth-context";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

// Curated selection of high-res photos across every service
const CAROUSEL_PHOTOS = [
  { src: "/photos/weddings/weddings_01.jpg", title: "Weddings", quote: "Cinematic, documentary wedding storytelling." },
  { src: "/photos/weddings/weddings_02.jpg", title: "Weddings", quote: "Authentic love stories documented with emotion." },
  { src: "/photos/portraits/portraits_01.jpg", title: "Portraits", quote: "Character-driven beauty and individual elegance." },
  { src: "/photos/portraits/portraits_02.jpg", title: "Beauty & Portraits", quote: "Natural storytelling with refined lighting." },
  { src: "/photos/family/family_01.jpg", title: "Family", quote: "Warmth, spontaneous laughter and tender milestones." },
  { src: "/photos/family/family_02.jpg", title: "Family", quote: "Relaxed, unhurried, and authentic family connections." },
  { src: "/photos/events/events_01.jpg", title: "Events", quote: "Live atmosphere and celebratory galas documented." },
  { src: "/photos/events/events_02.jpg", title: "Events", quote: "Dynamic occasions captured with an editorial eye." },
  { src: "/photos/behind-the-scenes/behind-the-scenes_01.jpg", title: "Behind the Scenes", quote: "On set craft and real production moments." },
  { src: "/photos/behind-the-scenes/behind-the-scenes_05.jpg", title: "Masterclasses", quote: "Professional photography & retouching education." },
  { src: "/photos/birthday/birthday_01.jpg", title: "Birthdays", quote: "Vibrant milestone celebrations preserved in joy." },
  { src: "/photos/personal/personal_01.jpg", title: "Personal Branding", quote: "Tailored brand imagery for creators & founders." },
  { src: "/photos/personal/personal_06.jpg", title: "Editorial", quote: "Natural, authentic portraiture in Manchester." },
  { src: "/photos/sports/sports_01.jpg", title: "Sports & Athletics", quote: "Decisive athletic speed and high-octane focus." },
  { src: "/photos/sports/sports_02.jpg", title: "Sports & Athletics", quote: "Energy, motion and power captured live." },
];

export function AuthPage({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const { user, isOwner, loading, signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carousel state: RANDOM initial index so it never starts from a fixed picture!
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    // Pick random slide on initial mount
    const randomIndex = Math.floor(Math.random() * CAROUSEL_PHOTOS.length);
    setActiveSlide(randomIndex);
  }, []);

  // Auto advance carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_PHOTOS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Redirect upon authenticated user:
  // If owner / admin -> /admin
  // If customer -> /account
  useEffect(() => {
    if (!loading && user) {
      if (isOwner || isAdminEmail(user.email)) {
        router.replace("/admin");
      } else {
        router.replace("/account");
      }
    }
  }, [user, isOwner, loading, router]);

  // Synchronize guest bookings from localStorage upon successful sign in or sign up
  const syncGuestBookings = async (uid: string) => {
    try {
      const stored = localStorage.getItem("sh_guest_bookings");
      if (!stored) return;
      const claims = JSON.parse(stored);
      if (Array.isArray(claims) && claims.length > 0) {
        const res = await fetch("/api/bookings/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claims, customerUid: uid }),
        });
        const data = await res.json();
        if (data.success && data.claimedIds?.length > 0) {
          localStorage.removeItem("sh_guest_bookings");
        }
      }
    } catch (err) {
      console.warn("Guest sync notice:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        if (!email) {
          setError("Please enter your email address.");
          setSubmitting(false);
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("Password reset email sent! Please check your inbox.");
        setSubmitting(false);
        return;
      }

      if (mode === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.");
          setSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(email, password, name.trim());
        if (res.user) {
          await syncGuestBookings(res.user.uid);
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.user) {
          await syncGuestBookings(res.user.uid);
          if (isAdminEmail(res.user.email)) {
            router.replace("/admin");
            return;
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        await syncGuestBookings(res.user.uid);
        if (isAdminEmail(res.user.email)) {
          router.replace("/admin");
          return;
        }
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentPhoto = CAROUSEL_PHOTOS[activeSlide] || CAROUSEL_PHOTOS[0]!;

  return (
    <div className="h-screen w-full flex bg-white font-sans antialiased text-[#101828] overflow-hidden">
      {/* ========================================================
          LEFT COLUMN: Clean UntitledUI Authentication Form
      ======================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-hidden p-6 sm:p-8 md:p-12 lg:p-14 xl:p-16">
        {/* Top Header & Logo */}
        <div className="flex items-center justify-between flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[#101828] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm group-hover:scale-105 transition-transform">
              SH
            </div>
            <span className="font-bold text-base tracking-tight text-[#101828]">SH Photography</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-[#667085] hover:text-[#101828] transition-colors"
          >
            ← Return to site
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-md w-full mx-auto py-8 sm:py-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101828]">
              {mode === "signin"
                ? "Welcome back"
                : mode === "signup"
                ? "Create your account"
                : "Reset your password"}
            </h1>
            <p className="text-sm text-[#667085] mt-2 font-normal">
              {mode === "signin"
                ? "Please enter your details to access your studio portal."
                : mode === "signup"
                ? "Join to manage your booked sessions and download your client gallery."
                : "Enter your account email to receive a password reset link."}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#fef3f2] border border-[#fee4e2] text-[#b42318] text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#ecfdf3] border border-[#d1fadf] text-[#027a48] text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Benedict Henry"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d0d5dd] bg-white text-sm text-[#101828] placeholder:text-[#98a2b3] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#101828]/15 focus:border-[#101828] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d0d5dd] bg-white text-sm text-[#101828] placeholder:text-[#98a2b3] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#101828]/15 focus:border-[#101828] transition-all"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#d0d5dd] bg-white text-sm text-[#101828] placeholder:text-[#98a2b3] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#101828]/15 focus:border-[#101828] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] hover:text-[#475467] transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#475467] select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#d0d5dd] text-[#101828] focus:ring-[#101828]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode("forgot");
                  }}
                  className="font-semibold text-[#101828] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#101828] hover:bg-[#1d2939] text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === "signin" ? (
                "Sign in"
              ) : mode === "signup" ? (
                "Create account"
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          {/* Google Sign In (for signin and signup) */}
          {mode !== "forgot" && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#f2f4f7]" />
                </div>
                <span className="relative bg-white px-3 text-xs font-medium text-[#98a2b3] uppercase tracking-wider">
                  or
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl border border-[#d0d5dd] bg-white hover:bg-[#f9fafb] text-sm font-semibold text-[#344054] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </>
          )}

          {/* Toggle between Sign In, Sign Up, and Forgot */}
          <div className="mt-8 text-center text-xs text-[#475467]">
            {mode === "signin" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode("signup");
                  }}
                  className="font-bold text-[#101828] hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode("signin");
                  }}
                  className="font-bold text-[#101828] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: Random Carousel from all services
          (Never a fixed picture to start from)
      ======================================================== */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0c111d] overflow-hidden select-none">
        {/* Active Carousel Photo */}
        <div className="absolute inset-0">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.title}
            fill
            sizes="50vw"
            priority
            className="object-cover transition-opacity duration-1000 transform-gpu"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
        </div>

        {/* Floating Content Over Carousel */}
        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16 text-white z-10">
          {/* Top Tag */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-bold text-white/90 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
              SH Portfolio Showcase
            </span>
            <span className="text-xs text-white/70 font-mono">
              {activeSlide + 1} / {CAROUSEL_PHOTOS.length}
            </span>
          </div>

          {/* Bottom Captions & Carousel Indicators */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest font-semibold text-[#e8491c] bg-white/10 backdrop-blur-md px-3 py-0.5 rounded-full mb-2">
                {currentPhoto.title}
              </span>
              <p className="text-xl sm:text-2xl font-display font-medium text-white/95 leading-snug max-w-lg">
                &ldquo;{currentPhoto.quote}&rdquo;
              </p>
            </div>

            {/* Indicator Pills (matching the mockup) */}
            <div className="flex items-center gap-2 pt-2">
              {CAROUSEL_PHOTOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? "w-8 bg-white" : "w-2 bg-white/35 hover:bg-white/60"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
