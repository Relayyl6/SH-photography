"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Download,
  AlertCircle,
  LogOut,
  CalendarCheck2,
} from "lucide-react";

interface GuestClaimItem {
  bookingId: string;
  claimToken: string;
}

export default function CustomerAccountPage() {
  const { user, loading, signInWithEmail, signInWithGoogle, signUpWithEmail, signOut } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Customer's bookings
  const [myBookings, setMyBookings] = useState([
    {
      id: "bk_cust_01",
      sessionName: "Weddings (Full Day)",
      date: "2026-11-14",
      start: "10:00",
      end: "18:00",
      status: "confirmed",
      location: "King Street Townhouse, Manchester",
    },
  ]);

  // Automatic guest booking claiming upon login
  useEffect(() => {
    async function claimGuestBookings() {
      if (!user) return;

      try {
        const stored = localStorage.getItem("sh_guest_bookings");
        if (!stored) return;

        const claims: GuestClaimItem[] = JSON.parse(stored);
        if (!Array.isArray(claims) || claims.length === 0) return;

        const res = await fetch("/api/bookings/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claims, customerUid: user.uid }),
        });

        const data = await res.json();
        if (data.success && data.claimedIds?.length > 0) {
          // Remove claimed bookings from localStorage only on confirmed success
          localStorage.removeItem("sh_guest_bookings");
          setClaimedNotice(`Successfully linked ${data.claimedIds.length} previous booking(s) to your account!`);
          setTimeout(() => setClaimedNotice(null), 5000);
        }
      } catch (err) {
        console.warn("Guest claiming check error:", err);
      }
    }

    claimGuestBookings();
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Generate .ics calendar download
  const downloadCalendarFile = (booking: any) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SH Photography//Booking Calendar//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Photoshoot with SH Photography (${booking.sessionName})`,
      `DESCRIPTION:Shoot booked with Benedict Henry. Location: ${booking.location}`,
      `LOCATION:${booking.location}`,
      `DTSTART:${booking.date.replace(/-/g, "")}T100000Z`,
      `DTEND:${booking.date.replace(/-/g, "")}T180000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `shoot-${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e8491c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, show customer sign in / sign up
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex flex-col justify-center items-center p-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-lg shadow-md mx-auto">
              SH
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#1c1b1a]">Client Portal</h1>
          <p className="text-xs text-[#7a766f] mt-1">
            Access your booked photography sessions, schedule, and downloads
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#e6e4dc]">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="flex rounded-xl bg-[#f5f4ef] p-1 mb-5">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === "login" ? "bg-white text-[#1c1b1a] shadow-sm" : "text-[#7a766f]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === "signup" ? "bg-white text-[#1c1b1a] shadow-sm" : "text-[#7a766f]"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-[#48453f] mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e4dc] text-xs focus:ring-2 focus:ring-[#e8491c]/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e4dc] text-xs focus:ring-2 focus:ring-[#e8491c]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48453f] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6e4dc] text-xs focus:ring-2 focus:ring-[#e8491c]/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50 mt-2"
            >
              {submitting ? "Processing..." : mode === "login" ? "Sign In" : "Register Account"}
            </button>
          </form>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#f0eee8]" />
            </div>
            <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-[#9d9990]">
              or
            </span>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl border border-[#e6e4dc] bg-white hover:bg-[#faf9f6] text-xs font-semibold text-[#383632] transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue with Google</span>
          </button>

          <div className="mt-5 text-center">
            <Link href="/" className="text-[11px] font-semibold text-[#8a867f] hover:text-[#1c1b1a]">
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated customer view
  return (
    <div className="min-h-screen bg-[#f7f6f2] p-4 sm:p-8 selection:bg-[#e8491c] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {(user.displayName || user.email || "SH").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1c1b1a]">
                Welcome back, {user.displayName || user.email}
              </h1>
              <p className="text-xs text-[#7a766f]">Client Account Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c] hover:bg-[#f5f4ef]"
            >
              Public Site
            </Link>
            <button
              onClick={() => signOut()}
              className="px-3.5 py-1.5 rounded-xl bg-[#f5f4ef] text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {claimedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{claimedNotice}</span>
          </div>
        )}

        {/* Shoots Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0eee8]">
            <h2 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-[#e8491c]" />
              <span>Your Booked Sessions</span>
            </h2>
            <Link
              href="/book"
              className="text-xs font-bold text-[#e8491c] hover:underline"
            >
              + Book Another Shoot
            </Link>
          </div>

          <div className="space-y-4">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-[#faf9f6] border border-[#e8e6df] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1c1b1a]">{b.sessionName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#7a766f] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#9d9990]" />
                    <span>
                      {b.date} ({b.start} – {b.end})
                    </span>
                  </p>
                  <p className="text-[11px] text-[#8a867f] mt-1">{b.location}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCalendarFile(b)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e6e4dc] text-xs font-bold text-[#1c1b1a] hover:bg-[#f5f4ef] shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7a766f]" />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
