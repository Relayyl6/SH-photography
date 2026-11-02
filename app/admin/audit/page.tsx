"use client";

import React from "react";
import Link from "next/link";
import { History, ChevronLeft, Shield } from "lucide-react";

export default function AdminAuditPage() {
  const auditLogs = [
    {
      id: "aud_01",
      action: "GRANT_OWNER_ROLE",
      actor: "system/grant-owner-script",
      target: "shfotography1@gmail.com",
      time: "2026-11-02 19:30:12",
      details: "Set custom claim role='owner' and wrote admins/{uid} record.",
    },
    {
      id: "aud_02",
      action: "UPDATE_BENTO_SLOT",
      actor: "Benedict Henry",
      target: "bento/home",
      time: "2026-11-02 18:45:00",
      details: "Assigned weddings_02 to slot 1.",
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
            Security &amp; Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Immutable log of administrative changes, role grants, and content publications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e8e6df] shadow-sm divide-y divide-[#f0eee8] overflow-hidden">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f5f4ef] text-[#1c1b1a] flex items-center justify-center shrink-0 border border-[#e6e4dc]">
                <Shield className="w-4 h-4 text-[#e8491c]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#e8491c] bg-[#fff2ed] px-2 py-0.5 rounded border border-[#fbdcd0]">
                  {log.action}
                </span>
                <p className="text-xs font-semibold text-[#1c1b1a] mt-1">{log.details}</p>
                <p className="text-[11px] text-[#8a867f] mt-0.5 font-mono">
                  Actor: {log.actor} · Target: {log.target}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#9d9990] font-mono whitespace-nowrap">
              {log.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
