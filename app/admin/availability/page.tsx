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
  Trash2,
  RefreshCw,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

interface BlockedDay {
  date: string; // YYYY-MM-DD
  reason: string;
}

interface DaySchedule {
  open: boolean;
  start: string;
  end: string;
}

interface WeeklyScheduleConfig {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DEFAULT_SCHEDULE: WeeklyScheduleConfig = {
  monday: { open: true, start: "09:00", end: "18:00" },
  tuesday: { open: true, start: "09:00", end: "18:00" },
  wednesday: { open: true, start: "09:00", end: "18:00" },
  thursday: { open: true, start: "09:00", end: "18:00" },
  friday: { open: true, start: "09:00", end: "18:00" },
  saturday: { open: true, start: "10:00", end: "16:00" },
  sunday: { open: false, start: "10:00", end: "16:00" },
};

const WEEKDAY_KEYS: (keyof WeeklyScheduleConfig)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AdminAvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [schedule, setSchedule] = useState<WeeklyScheduleConfig>(DEFAULT_SCHEDULE);
  const [alwaysClosedDays, setAlwaysClosedDays] = useState<string[]>(["sunday"]);
  const [bufferMinutes, setBufferMinutes] = useState<number>(30);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from Firestore
  const loadAvailability = async () => {
    setLoading(true);
    try {
      // 1. Load settings/availability doc
      const setSnap = await getDoc(doc(db, "settings", "availability"));
      if (setSnap.exists()) {
        const data = setSnap.data();
        if (data.weeklySchedule) setSchedule(data.weeklySchedule);
        if (Array.isArray(data.alwaysClosedDays)) setAlwaysClosedDays(data.alwaysClosedDays);
        if (typeof data.bufferMinutes === "number") setBufferMinutes(data.bufferMinutes);
      }

      // 2. Load availability collection (individual blocked dates)
      const availSnap = await getDocs(collection(db, "availability"));
      const blocked: BlockedDay[] = [];
      availSnap.forEach((d) => {
        const dData = d.data();
        if (dData.isOpen === false) {
          blocked.push({
            date: d.id,
            reason: dData.blockedReason || "Studio Booked / Unavailable",
          });
        }
      });
      setBlockedDays(blocked);
    } catch (err) {
      console.error("Failed to load availability from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

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

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const isBlocked = (dateStr: string) => blockedDays.some((b) => b.date === dateStr);

  const handleToggleDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    if (dateStr < todayIso) {
      return; // Passed dates are automatically locked and cannot be opened
    }

    if (isBlocked(dateStr)) {
      setBlockedDays(blockedDays.filter((b) => b.date !== dateStr));
    } else {
      setSelectedDate(dateStr);
      setBlockReason("Studio Booked / Private Shoot");
    }
  };

  const handleConfirmBlock = () => {
    if (!selectedDate) return;
    setBlockedDays([...blockedDays, { date: selectedDate, reason: blockReason || "Unavailable" }]);
    setSelectedDate(null);
    setBlockReason("");
  };

  const handleScheduleToggle = (day: keyof WeeklyScheduleConfig) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }));
  };

  const handleTimeChange = (
    day: keyof WeeklyScheduleConfig,
    field: "start" | "end",
    val: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));
  };

  const handleToggleAlwaysClosed = (dayName: string) => {
    setAlwaysClosedDays((prev) =>
      prev.includes(dayName) ? prev.filter((d) => d !== dayName) : [...prev, dayName]
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);

      // 1. Save settings doc
      await setDoc(
        doc(db, "settings", "availability"),
        {
          weeklySchedule: schedule,
          alwaysClosedDays,
          bufferMinutes,
          updatedAt: Date.now(),
          published: true,
        },
        { merge: true }
      );

      // 2. Save individual blocked dates
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
    } catch (err) {
      console.error("Error saving availability:", err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleUnblockDate = async (dateStr: string) => {
    try {
      setBlockedDays((prev) => prev.filter((x) => x.date !== dateStr));
      await deleteDoc(doc(db, "availability", dateStr));
    } catch (e) {
      console.warn("Unblock date error:", e);
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
            Configure studio operating hours per day of the week, block off whole weekdays (e.g. Sunday), or tap specific calendar dates to lock slots for clients.
          </p>
        </div>

        <button
          onClick={handleSaveAvailability}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#e8491c] hover:bg-[#d03d12] text-white text-xs font-bold transition-all shadow-md shadow-[#e8491c]/20 disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Schedule Synchronized Live!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Calendar &amp; Hours</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1c1b1a]">{monthLabel}</h3>
              <p className="text-xs text-[#7a766f]">Tap any date to lock or release it for client bookings</p>
            </div>
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
              const isPast = dateStr < todayIso;
              const blocked = !isPast && isBlocked(dateStr);

              // Check if day of week is permanently closed
              const dayDate = new Date(year, month, day);
              const dayOfWeekName = WEEKDAY_KEYS[(dayDate.getDay() + 6) % 7]!;
              const isDayOff = alwaysClosedDays.includes(dayOfWeekName) || !schedule[dayOfWeekName]?.open;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleToggleDay(day)}
                  className={`aspect-square rounded-2xl p-2 text-left flex flex-col justify-between transition-all border ${
                    isPast
                      ? "bg-[#f5f4ef]/60 border-[#e8e6df] text-[#a8a49c] cursor-not-allowed opacity-60 select-none"
                      : blocked
                      ? "bg-red-50/80 border-red-200 text-red-900 hover:bg-red-100"
                      : isDayOff
                      ? "bg-stone-100/70 border-stone-200 text-stone-500"
                      : "bg-[#faf9f6] border-[#e8e6df] text-[#1c1b1a] hover:bg-[#f5f4ef] hover:border-[#1c1b1a]"
                  }`}
                  title={isPast ? "Date has passed (automatically locked)" : blocked ? "Locked date" : isDayOff ? "Closed day" : "Click to lock date"}
                >
                  <span className="text-xs font-bold">{day}</span>
                  <div className="flex items-center justify-between">
                    {isPast ? (
                      <Clock className="w-3.5 h-3.5 text-[#a8a49c]" />
                    ) : blocked ? (
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                    ) : isDayOff ? (
                      <span className="text-[9px] font-semibold text-stone-400">Off</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                    <span className="text-[9px] font-semibold text-[#8a867f]">
                      {isPast ? "Passed" : blocked ? "Locked" : isDayOff ? "Closed" : "Open"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-[#f0eee8] flex flex-wrap items-center gap-4 text-xs text-[#7a766f]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Open for Booking</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Locked / Booked Date</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span>Closed Day (Off)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#a8a49c]" />
              <span>Passed Dates (Auto-Locked)</span>
            </span>
          </div>
        </div>

        {/* Operating Windows & Always Closed Days (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Always Closed Weekday shortcuts */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#e8491c]" />
              <span>Always-Closed Days (Weekly)</span>
            </h4>
            <p className="text-xs text-[#7a766f] mb-3">
              Select any weekdays to automatically close the studio every week:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {WEEKDAY_KEYS.map((k) => {
                const isClosed = alwaysClosedDays.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleToggleAlwaysClosed(k)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border text-left transition-colors flex items-center justify-between ${
                      isClosed
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-[#faf9f6] text-[#48453f] border-[#f0eee8] hover:border-stone-300"
                    }`}
                  >
                    <span>{k}</span>
                    <span className="text-[10px]">{isClosed ? "Closed" : "Open"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buffer time */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#e8491c]" />
              <span>Buffer Time Between Shoots</span>
            </h4>
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] bg-white text-xs font-semibold text-[#1c1b1a]"
            >
              <option value={15}>15 Minutes Buffer</option>
              <option value={30}>30 Minutes Buffer (Recommended)</option>
              <option value={45}>45 Minutes Buffer</option>
              <option value={60}>60 Minutes Buffer</option>
            </select>
          </div>

          {/* Currently Blocked Dates List */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm">
            <h4 className="text-sm font-bold text-[#1c1b1a] mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Locked Dates ({blockedDays.length})</span>
            </h4>
            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto">
              {blockedDays.length === 0 ? (
                <p className="text-xs text-[#8a867f] italic">No dates currently locked.</p>
              ) : (
                blockedDays.map((b) => (
                  <div
                    key={b.date}
                    className="p-3 rounded-2xl bg-red-50/50 border border-red-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-red-950">{b.date}</p>
                      <p className="text-[11px] text-red-700 truncate max-w-[160px]">{b.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnblockDate(b.date)}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Unlock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Table (Time to Time per day of week) */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8e6df] shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#1c1b1a] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#e8491c]" />
            <span>Weekly Time Windows (Time to Time per Day of the Week)</span>
          </h3>
          <p className="text-xs text-[#7a766f] mt-0.5">
            Set exact opening and closing shoot times for each day of the week. These time slots dynamically appear in the client booking picker.
          </p>
        </div>

        <div className="divide-y divide-[#f0eee8]">
          {WEEKDAY_KEYS.map((k) => {
            const dayConf = schedule[k] || { open: true, start: "09:00", end: "18:00" };
            return (
              <div
                key={k}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="w-36 flex items-center gap-2">
                  <span className="font-bold text-[#1c1b1a] capitalize text-sm">{k}</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={dayConf.open}
                      onChange={() => handleScheduleToggle(k)}
                      className="w-4 h-4 rounded text-[#e8491c] focus:ring-[#e8491c]"
                    />
                    <span>{dayConf.open ? "Studio Open" : "Studio Closed"}</span>
                  </label>

                  {dayConf.open ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8a867f]">From:</span>
                      <input
                        type="time"
                        value={dayConf.start}
                        onChange={(e) => handleTimeChange(k, "start", e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-[#e6e4dc] bg-white font-mono text-xs text-stone-900"
                      />
                      <span className="text-[#8a867f]">To:</span>
                      <input
                        type="time"
                        value={dayConf.end}
                        onChange={(e) => handleTimeChange(k, "end", e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-[#e6e4dc] bg-white font-mono text-xs text-stone-900"
                      />
                    </div>
                  ) : (
                    <span className="text-stone-400 italic">No booking slots offered on {k}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Date Reason Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#e6e4dc] animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#1c1b1a] mb-1">Lock {selectedDate}</h3>
            <p className="text-xs text-[#7a766f] mb-4">
              Enter a reason for closing or holding the studio on this date.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason (e.g. Wedding shoot, Maintenance, Travel)"
                className="w-full px-3 py-2 rounded-xl border border-[#e6e4dc] text-xs"
                autoFocus
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                >
                  Confirm Lock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
