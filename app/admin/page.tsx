"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheck2,
  CalendarDays,
  Image as ImageIcon,
  Layers,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Plus,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  getSiteSettings,
  getBentoSlots,
  getPortfolioImages,
  getSessions,
  getBookings,
  DEFAULT_BENTO_HOME,
  DEFAULT_PORTFOLIO_IMAGES,
  DEFAULT_BOOKINGS,
} from "@/lib/content";
import { BentoHomeDoc, PortfolioImageDoc, SessionDoc, BookingDoc } from "@/types/firebase";

export default function AdminOverviewPage() {
  const [bento, setBento] = useState<BentoHomeDoc>(DEFAULT_BENTO_HOME);
  const [images, setImages] = useState<PortfolioImageDoc[]>(DEFAULT_PORTFOLIO_IMAGES);
  const [sessions, setSessions] = useState<SessionDoc[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingDoc[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const deletedIds: string[] = JSON.parse(localStorage.getItem("sh_deleted_booking_ids") || "[]");
        if (deletedIds.length > 0) {
          return DEFAULT_BOOKINGS.filter((b) => !deletedIds.includes(b.id));
        }
      } catch {}
    }
    return DEFAULT_BOOKINGS;
  });
  const [loading, setLoading] = useState(true);

  // Today's formatted date
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    async function load() {
      try {
        const [bentoData, imgs, sess, bks] = await Promise.all([
          getBentoSlots(),
          getPortfolioImages(),
          getSessions(),
          getBookings(),
        ]);
        setBento(bentoData);
        setImages(imgs);
        setSessions(sess);
        const deletedIds: string[] = JSON.parse(
          (typeof window !== "undefined" && localStorage.getItem("sh_deleted_booking_ids")) || "[]"
        );
        const activeBookings = (bks || []).filter((b) => !deletedIds.includes(b.id));
        setRecentBookings(activeBookings.slice(0, 4));
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Map image map for bento preview
  const imgMap = new Map<string, PortfolioImageDoc>();
  images.forEach((img) => {
    imgMap.set(img.id, img);
    // Also map by filename in case slot uses filename without extension
    const base = img.url.split("/").pop()?.replace(/\.[^/.]+$/, "");
    if (base) imgMap.set(base, img);
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Banner & Quick Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8491c] bg-[#fff2ed] px-3 py-1 rounded-full border border-[#fbdcd0]">
              Studio Active
            </span>
            <span className="text-xs text-[#8a867f] font-medium">{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1b1a]">
            {getGreeting()}, Benedict
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Here is your live studio snapshot. Manage your 9-slot Bento layout, upcoming client bookings, and portfolio media.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/bento"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Bento</span>
          </Link>

          <Link
            href="/admin/availability"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Block Date</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#f5f4ef] text-[#2c2b29] text-xs font-bold transition-colors border border-[#e6e4dc]"
          >
            <Eye className="w-3.5 h-3.5 text-[#7a766f]" />
            <span>Live Site</span>
            <ArrowUpRight className="w-3 h-3 text-[#9d9990]" />
          </Link>
        </div>
      </div>

      {/* 2. Top Bento Stat Cards (Reference: Financial Dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Upcoming Shoots */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e6df] shadow-sm relative overflow-hidden group hover:border-[#dedad0] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a867f]">
              Upcoming Shoots
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#e8491c] flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1c1b1a]">{recentBookings.length}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Active
            </span>
          </div>
          <p className="text-[11px] text-[#8a867f] mt-2">
            {recentBookings[0] ? `Next shoot: ${recentBookings[0].slot?.date || "Upcoming"}` : "No active shoots scheduled"}
          </p>
        </div>

        {/* Card 2: Total Gallery Media */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e6df] shadow-sm relative overflow-hidden group hover:border-[#dedad0] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a867f]">
              Portfolio Media
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1c1b1a]">{images.length}</span>
            <span className="text-xs font-semibold text-[#7a766f]">Photos</span>
          </div>
          <p className="text-[11px] text-[#8a867f] mt-2">Across 8 session categories</p>
        </div>

        {/* Card 3: Active Sessions */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e6df] shadow-sm relative overflow-hidden group hover:border-[#dedad0] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a867f]">
              Active Sessions
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1c1b1a]">{sessions.length || 8}</span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              10 Packages
            </span>
          </div>
          <p className="text-[11px] text-[#8a867f] mt-2">Prices hidden by default</p>
        </div>

        {/* Card 4: Bento Grid Slots */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e6df] shadow-sm relative overflow-hidden group hover:border-[#dedad0] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a867f]">
              Home Bento Slots
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1c1b1a]">9 / 9</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Fixed
            </span>
          </div>
          <p className="text-[11px] text-[#8a867f] mt-2">All slots populated &amp; active</p>
        </div>
      </div>

      {/* 3. Bento Layout Showcase & Recent Activity (Two Column Bento Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column (7 cols): Interactive Home Bento Preview */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e6df] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8491c]">
                  Visual Manager
                </span>
                <h3 className="text-lg font-bold text-[#1c1b1a] mt-0.5">Home Bento Grid (9 Slots)</h3>
                <p className="text-xs text-[#7a766f]">
                  Layout positions are locked to the design contract. Click any slot to choose a new portfolio photo.
                </p>
              </div>
              <Link
                href="/admin/bento"
                className="text-xs font-bold text-[#e8491c] hover:underline inline-flex items-center gap-1"
              >
                <span>Edit Bento</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Interactive 9-slot Miniature Bento */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#f7f6f2] border border-[#e6e4dc]">
              {bento.slots.map((slot, index) => {
                const img = imgMap.get(slot.portfolioImageId);
                const displaySrc = slot.customImageUrl || (img ? img.url : `/photos/weddings/weddings_0${(index % 4) + 1}.jpg`);
                return (
                  <Link
                    key={slot.slotId}
                    href={`/admin/bento?slot=${slot.slotId}`}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-black/10 border border-white/60 hover:ring-2 hover:ring-[#e8491c] transition-all"
                  >
                    <Image
                      src={displaySrc}
                      alt={slot.label || `Slot ${slot.slotId}`}
                      fill
                      sizes="150px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      #{slot.slotId}
                    </span>
                    <span className="absolute bottom-1.5 inset-x-1.5 text-[10px] font-semibold text-white truncate text-center">
                      {slot.label || `Slot ${slot.slotId}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#f0eee8] flex items-center justify-between text-xs text-[#8a867f]">
            <span>Automatic photo rotation: <strong className="text-[#1c1b1a]">Ready</strong></span>
            <Link href="/admin/bento" className="font-semibold text-[#e8491c] hover:underline">
              Configure Rotation →
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Recent Bookings & Inquiries */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-7 border border-[#e8e6df] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a867f]">
                  Pipeline
                </span>
                <h3 className="text-lg font-bold text-[#1c1b1a] mt-0.5">Recent Bookings</h3>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-bold text-[#e8491c] hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8a867f] bg-[#faf9f6] rounded-2xl border border-dashed border-[#e8e6df]">
                  No active bookings found.
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                  className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#e8e6df] hover:bg-[#f5f4ef] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1c1b1a] truncate">
                      {booking.customer?.name || "Client"}
                    </p>
                    <p className="text-[11px] text-[#7a766f] truncate mt-0.5">
                      {booking.sessionSnapshot?.name || "Session"}
                    </p>
                    <p className="text-[10px] text-[#9d9990] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {booking.slot?.date} · {booking.slot?.start}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                        booking.status === "confirmed"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : booking.status === "pending"
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : "text-stone-700 bg-stone-50 border-stone-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <Link
                      href={`/admin/bookings?id=${booking.id}`}
                      className="text-[11px] font-semibold text-[#e8491c] hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#f0eee8] text-center">
            <Link
              href="/admin/bookings"
              className="w-full py-2.5 rounded-2xl bg-[#f5f4ef] hover:bg-[#ebe9e1] text-xs font-bold text-[#1c1b1a] inline-flex items-center justify-center gap-1.5 border border-[#e6e4dc] transition-colors"
            >
              <span>Manage All Inquiries &amp; Bookings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
