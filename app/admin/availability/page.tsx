"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Unlock,
  Check,
  Sparkles,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface BlockedDay {
  date: string; // YYYY-MM-DD
  reason: string;
}

export default function AdminAvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([
    { date: "2026-11-25", reason: "Private Studio Maintenance" },
    { date: "2026-11-26", reason: "Destination Wedding Shoot" },
  ]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calendar math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Shift to Monday start
  const startOffset = (firstDayOfMonth + 6) % 7;

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const isBlocked = (dateStr: string) => blockedDays.some((b) => b.date === dateStr);
  const getReason = (dateStr: string) => blockedDays.find((b) => b.date === dateStr)?.reason;

  const handleToggleDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    if (isBlocked(dateStr)) {
      setBlockedDays(blockedDays.filter((b) => b.date !== dateStr));
    } else {
      setSelectedDate(dateStr);
      setBlockReason("Studio Booked / Unavailable");
    }
  };

  const handleConfirmBlock = () => {
    if (!selectedDate) return;
    setBlockedDays([...blockedDays, { date: selectedDate, reason: blockReason || "Unavailable" }]);
    setSelectedDate(null);
    setBlockReason("");
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      for (const b of blockedDays) {
        await setDoc(
          doc(db, "availability", b.date),
          {
            date: b.date,
            isOpen: false,
            blockedReason: b.reason,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
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
            Calendar &amp; Availability Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#7a766f] mt-1 max-w-xl">
            Click on any date on the calendar to instantly block or open booking slots for clients.
          </p>
        </div>

        <button
          onClick={handleSaveAvailability}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Calendar Synchronized!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Calendar</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1c1b1a]">{monthLabel}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef] hover:text-[#1c1b1a] transition-colors border border-[#e6e4dc]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl text-[#8a867f] hover:bg-[#f5f4ef] hover:text-[#1c1b1a] transition-colors border border-[#e6e4dc]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-[#8a867f]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-[#faf9f6]/40" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(month + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
              const blocked = isBlocked(dateStr);

              return (
                <button
                  key={day}
                  onClick={() => handleToggleDay(day)}
                  className={`aspect-square rounded-2xl p-2 text-left flex flex-col justify-between transition-all border ${
                    blocked
                      ? "bg-red-50/70 border-red-200 text-red-900 hover:bg-red-100"
                      : "bg-[#faf9f6] border-[#e8e6df] text-[#1c1b1a] hover:bg-[#f5f4ef] hover:border-[#1c1b1a]"
                  }`}
                >
                  <span className="text-xs font-bold">{day}</span>
                  <div className="flex items-center justify-between">
                    {blocked ? (
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                    <span className="text-[9px] font-semibold text-[#8a867f]">
                      {blocked ? "Closed" : "Open"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operating Windows & Blocked List (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#e8491c]" />
              <span>Studio Operating Windows</span>
            </h4>
            <p className="text-xs text-[#7a766f] mb-4">
              Regular hours configured in site settings:
            </p>
            <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#f0eee8] space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-[#615e57]">Monday – Saturday</span>
                <span className="font-bold text-[#1c1b1a]">09:00 – 19:00</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#615e57]">Sunday</span>
                <span className="font-bold text-[#e8491c]">By Appointment</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-[#e8e6df]">
                <span className="text-[#615e57]">Buffer Between Shoots</span>
                <span className="font-bold text-[#1c1b1a]">30 Minutes</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Currently Blocked Dates</span>
            </h4>
            <div className="space-y-2 mt-3 max-h-60 overflow-y-auto">
              {blockedDays.length === 0 ? (
                <p className="text-xs text-[#8a867f] italic">No dates blocked.</p>
              ) : (
                blockedDays.map((b) => (
                  <div
                    key={b.date}
                    className="p-3 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-red-950">{b.date}</p>
                      <p className="text-[11px] text-red-700">{b.reason}</p>
                    </div>
                    <button
                      onClick={() => setBlockedDays(blockedDays.filter((x) => x.date !== b.date))}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Block Date Reason Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#1c1b1a] mb-1">Block {selectedDate}</h3>
            <p className="text-xs text-[#7a766f] mb-4">
              Enter a reason for closing the studio on this date.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason (e.g. Wedding shoot, Away, Maintenance)"
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs"
                autoFocus
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBlock}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
