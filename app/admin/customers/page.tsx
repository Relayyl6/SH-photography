"use client";

import React from "react";
import Link from "next/link";
import { Users, ChevronLeft, ShieldCheck, Calendar, Mail } from "lucide-react";

export default function AdminCustomersPage() {
  const customers = [
    {
      uid: "usr_1",
      displayName: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      shootsCount: 1,
      joinedAt: "12 Oct 2026",
    },
    {
      uid: "usr_2",
      displayName: "Marcus Sterling",
      email: "marcus.sterling@example.com",
      shootsCount: 1,
      joinedAt: "28 Oct 2026",
    },
    {
      uid: "usr_3",
      displayName: "Sophia Chen",
      email: "sophia.chen@example.com",
      shootsCount: 2,
      joinedAt: "01 Nov 2026",
    },
  ];

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
            Customer Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Clients who signed up or claimed their guest bookings into an account.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e8e6df] shadow-sm divide-y divide-[#f0eee8] overflow-hidden">
        {customers.map((c) => (
          <div key={c.uid} className="p-5 flex items-center justify-between hover:bg-[#faf9f6]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1b1a] text-white flex items-center justify-center font-bold text-xs">
                {c.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1c1b1a]">{c.displayName}</p>
                <p className="text-xs text-[#7a766f]">{c.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#e8491c]">{c.shootsCount} Shoots</p>
              <p className="text-[11px] text-[#8a867f]">Joined {c.joinedAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
