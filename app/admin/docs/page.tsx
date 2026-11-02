"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle, ChevronLeft, BookOpen, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export default function AdminDocsPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e6df] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#8a867f] hover:text-[#1c1b1a] inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1b1a]">
            Owner Documentation &amp; Studio Guide
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Quick reference guide for managing the website, pricing visibility rules, and booking workflow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <Sparkles className="w-4 h-4 text-[#e8491c]" />
            <span>9-Slot Home Bento Rules</span>
          </div>
          <p className="text-xs text-[#615e57] leading-relaxed">
            The layout grid positions are strictly locked to maintain the editorial design contract. As the owner, you can swap the portfolio photo assigned to any of the 9 slots at any time. When you enable &quot;Auto-Rotate&quot;, the website will dynamically cycle photos from that category.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pricing Visibility Guarantee</span>
          </div>
          <p className="text-xs text-[#615e57] leading-relaxed">
            By default, all packages have prices hidden (&quot;show_price: false&quot;). Clients see &quot;Request a quote&quot; or custom price labels. Prices are only rendered if you explicitly toggle price visibility on in the Sessions manager.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <BookOpen className="w-4 h-4 text-[#e8491c]" />
            <span>Guest Claiming Workflow</span>
          </div>
          <p className="text-xs text-[#615e57] leading-relaxed">
            When clients book shoots as guests, booking tokens are saved in their browser&apos;s localStorage. When they sign up or log in, their account automatically claims those guest bookings via cryptographic verification.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1c1b1a]">
            <HelpCircle className="w-4 h-4 text-[#e8491c]" />
            <span>Support &amp; Technical Help</span>
          </div>
          <p className="text-xs text-[#615e57] leading-relaxed">
            All code and schemas are backed up in Firestore and git. For service account rotation or adding additional owner emails, set the <code className="text-[#e8491c] font-mono text-[11px]">ADMIN_EMAILS</code> environment variable and run <code className="text-[#e8491c] font-mono text-[11px]">npm run grant-owner</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
