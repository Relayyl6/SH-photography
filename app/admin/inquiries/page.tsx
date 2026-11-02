"use client";

import React from "react";
import Link from "next/link";
import { Mail, ChevronLeft, Clock, User, Phone, CheckCircle } from "lucide-react";

export default function AdminInquiriesPage() {
  const inquiries = [
    {
      id: "inq_01",
      name: "Olivia & Thomas",
      email: "olivia.t@example.co.uk",
      phone: "+44 7700 900123",
      service: "Weddings",
      message: "Hello Benedict! We love your documentary style and would love to check availability for our July 2027 wedding at Victoria Baths.",
      date: "Today, 14:22",
      status: "New",
    },
    {
      id: "inq_02",
      name: "Daniel Moore",
      email: "daniel@mcrcreative.com",
      phone: "+44 7890 123456",
      service: "Corporate & Personal Branding",
      message: "Looking for on-location headshots and atmospheric editorial portraits for our design studio leadership team in Ancoats.",
      date: "Yesterday, 09:15",
      status: "Replied",
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
            Inquiries &amp; Messages
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Messages received via the contact page email action and direct client requests.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#e8491c] flex items-center justify-center font-bold text-xs border border-orange-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1c1b1a]">{inq.name}</h4>
                  <p className="text-xs text-[#7a766f]">
                    {inq.email} · {inq.phone}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#fff2ed] text-[#e8491c] border border-[#fbdcd0]">
                {inq.service}
              </span>
            </div>

            <p className="text-xs text-[#383632] leading-relaxed bg-[#faf9f6] p-4 rounded-2xl border border-[#f0eee8]">
              &ldquo;{inq.message}&rdquo;
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#8a867f] pt-1">
              <span>Received {inq.date}</span>
              <a
                href={`mailto:${inq.email}?subject=RE: Photography Inquiry - SH Photography`}
                className="text-xs font-bold text-[#e8491c] hover:underline"
              >
                Reply via Email →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
