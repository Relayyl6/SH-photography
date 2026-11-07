"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronLeft,
  BookOpen,
  ShieldCheck,
  Sparkles,
  CalendarCheck,
  Users,
  Clock,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Lock,
} from "lucide-react";

export default function AdminDocsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "bookings" | "bento" | "pricing" | "sessions">("general");

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#8a867f] hover:text-[#1c1b1a] inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1b1a]">
            Owner Documentation &amp; Studio Operating Manual
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Complete operating instructions for managing photoshoots, multi-day calendar availability, pricing visibility guarantees, guest booking claiming, and gallery uploads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c1b1a] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Manage Bookings</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5f4ef] text-[#1c1b1a] text-xs font-semibold hover:bg-[#eae8df] transition-colors border border-[#e6e4dc]"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#eceae3]">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "general"
              ? "bg-[#e8491c] text-white shadow-sm"
              : "bg-white text-[#7a766f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef]"
          }`}
        >
          General &amp; Studio Rules
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "bookings"
              ? "bg-[#e8491c] text-white shadow-sm"
              : "bg-white text-[#7a766f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef]"
          }`}
        >
          Bookings &amp; Multi-Day Lock Engine
        </button>
        <button
          onClick={() => setActiveTab("bento")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "bento"
              ? "bg-[#e8491c] text-white shadow-sm"
              : "bg-white text-[#7a766f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef]"
          }`}
        >
          Homepage Bento Rules
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "pricing"
              ? "bg-[#e8491c] text-white shadow-sm"
              : "bg-white text-[#7a766f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef]"
          }`}
        >
          Pricing Visibility Guarantee
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "sessions"
              ? "bg-[#e8491c] text-white shadow-sm"
              : "bg-white text-[#7a766f] hover:text-[#1c1b1a] hover:bg-[#f5f4ef]"
          }`}
        >
          Gallery &amp; Session Management
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
              <Sparkles className="w-4 h-4 text-[#e8491c]" />
              <span>Studio Core Identity</span>
            </div>
            <p className="text-xs text-[#615e57] leading-relaxed">
              SH Photography is the creative practice of Benedict Henry, based in Manchester, UK and available to travel worldwide. The brand operates with an editorial and documentary philosophy where authentic storytelling comes first.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Single Shoot Per Day Guarantee</span>
            </div>
            <p className="text-xs text-[#615e57] leading-relaxed">
              Benedict Henry dedicates 100% of his creative energy to one major photoshoot or event per calendar day. Once any booking is confirmed, that date is locked automatically across the entire site and availability calendar.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
              <Users className="w-4 h-4 text-[#e8491c]" />
              <span>Guest Booking Claiming Workflow</span>
            </div>
            <p className="text-xs text-[#615e57] leading-relaxed">
              Clients who book as guests receive a cryptographic booking token stored in their browser. When they create an account or sign in to the Client Portal, their past bookings are automatically synced. Clients can also link bookings made under a different email by entering their Booking ID in the portal.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
              <HelpCircle className="w-4 h-4 text-[#e8491c]" />
              <span>Support &amp; Technical Administration</span>
            </div>
            <p className="text-xs text-[#615e57] leading-relaxed">
              Owner accounts are managed through Firebase Authentication. The primary owner emails are <code className="text-[#e8491c] font-mono text-[11px]">shfotography1@gmail.com</code> and <code className="text-[#e8491c] font-mono text-[11px]">oseghaleleonard39@gmail.com</code>.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings & Collision Rules */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
              <CalendarCheck className="w-4 h-4 text-[#e8491c]" />
              <span>Strict Collision Rules &amp; Multi-Day Events</span>
            </div>
            <p className="text-xs sm:text-sm text-[#615e57] leading-relaxed">
              The booking system enforces multi-tier conflict detection to prevent double bookings:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#615e57] leading-relaxed">
              <li>
                <strong>Single Date Lock:</strong> When a booking is confirmed on a date (e.g. 2026-11-14), no other event can be confirmed for that date.
              </li>
              <li>
                <strong>Multi-Day Encroachment Check:</strong> If an event spans 2+ days (e.g. a 2-Day Wedding starting Nov 14 spans Nov 14 and Nov 15), both days are locked. The system blocks confirming any other booking on Nov 14 OR Nov 15.
              </li>
              <li>
                <strong>Availability Protection:</strong> In the Availability Calendar, dates with active confirmed bookings cannot be casually unlocked. Unlocking a date with an active shoot requires first rescheduling or cancelling the shoot with client notification.
              </li>
              <li>
                <strong>Automatic Confirmation Email:</strong> When Benedict clicks &quot;Confirm Booking&quot;, an official booking confirmation email is automatically sent to the client with their confirmed date, time, location, deliverables, and Client Portal link.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Homepage Bento Rules */}
      {activeTab === "bento" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <Sparkles className="w-4 h-4 text-[#e8491c]" />
            <span>9-Slot Home Bento Rules</span>
          </div>
          <p className="text-xs sm:text-sm text-[#615e57] leading-relaxed">
            The layout grid positions are strictly locked to maintain the editorial design contract. As the owner, you can swap the portfolio photo assigned to any of the 9 slots at any time. When you enable &quot;Auto-Rotate&quot;, the website will dynamically cycle photos from that category.
          </p>
        </div>
      )}

      {/* Tab 4: Pricing Visibility Guarantee */}
      {activeTab === "pricing" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pricing Visibility Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-[#615e57] leading-relaxed">
            By default, all packages have prices hidden (<code className="text-[#e8491c] font-mono text-[11px]">&quot;show_price: false&quot;</code>). Clients see &quot;Request a quote&quot; or custom price labels. Prices are only rendered if you explicitly toggle price visibility on in the Sessions manager.
          </p>
        </div>
      )}

      {/* Tab 5: Gallery & Session Management */}
      {activeTab === "sessions" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <ImageIcon className="w-4 h-4 text-[#e8491c]" />
            <span>Dynamic Session Types &amp; Image Uploads</span>
          </div>
          <p className="text-xs sm:text-sm text-[#615e57] leading-relaxed">
            When you create a new session type or upload photos to an existing session:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-[#615e57] leading-relaxed">
            <li>
              <strong>Immediate Reflection:</strong> Newly uploaded photos appear in the session&apos;s gallery page (<code className="text-[#e8491c] font-mono text-[11px]">/portfolio/[session]</code>) and the auto-advancing slideshow on the portfolio and home pages.
            </li>
            <li>
              <strong>Merged Curation:</strong> Uploaded images appear at the top of the gallery alongside existing baseline photos, preserving a full gallery experience.
            </li>
            <li>
              <strong>New Sessions:</strong> Creating a session in <Link href="/admin/sessions" className="text-[#e8491c] font-semibold underline">Sessions &amp; Packages</Link> automatically enables it on <code className="text-[#e8491c] font-mono text-[11px]">/services</code>, <code className="text-[#e8491c] font-mono text-[11px]">/portfolio</code>, and the live booking form.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
