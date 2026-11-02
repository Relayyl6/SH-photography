"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const { user, isOwner, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isOwner) {
      router.push("/admin");
    }
  }, [user, isOwner, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await signInWithEmail(email, password);
      router.push("/admin");
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to sign in. Please verify credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signInWithGoogle();
      router.push("/admin");
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col justify-center items-center p-4 selection:bg-[#e8491c] selection:text-white">
      {/* Brand & Security Header */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Link href="/" className="inline-block group mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-xl tracking-tight shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
            SH
          </div>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#1c1b1a]">Owner Studio Portal</h1>
        <p className="text-xs text-[#7a766f] mt-1.5 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SH Photography Administration</span>
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl shadow-black/[0.04] border border-[#e6e4dc]">
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/60 flex items-start gap-3 text-red-700 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#48453f] mb-1.5">
              Owner Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shfotography1@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48453f] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6e4dc] bg-[#faf9f6] text-xs text-[#1c1b1a] placeholder:text-[#aaa59c] focus:outline-none focus:ring-2 focus:ring-[#e8491c]/20 focus:border-[#e8491c] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f0eee8]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-medium text-[#9d9990] uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl border border-[#e6e4dc] bg-white hover:bg-[#f9f8f5] text-xs font-semibold text-[#383632] transition-colors flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
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
          <span>Sign In with Google</span>
        </button>

        {/* Return link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[11px] font-semibold text-[#8a867f] hover:text-[#1c1b1a] transition-colors"
          >
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
