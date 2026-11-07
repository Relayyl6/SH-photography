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
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { getConsecutiveDates } from "@/lib/date-utils";

interface BlockedDay {
  date: string; // YYYY-MM-DD
  reason: string;
  isBooking?: boolean;
  bookingId?: string;
  bookingStatus?: "confirmed" | "pending" | "reschedule_requested";
  clientName?: string;
  clientEmail?: string;
  sessionName?: string;
  dayIndex?: number;
  totalDays?: number;
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
  const [lockedBookingNotice, setLockedBookingNotice] = useState<BlockedDay | null>(null);
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

      // 2. Load availability collection (individual manual blocked dates)
      const availSnap = await getDocs(collection(db, "availability"));
      const blocked: BlockedDay[] = [];
      availSnap.forEach((d) => {
        const dData = d.data();
        if (dData.isOpen === false) {
          blocked.push({
            date: d.id,
            reason: dData.blockedReason || "Studio Booked / Unavailable",
            isBooking: false,
          });
        }
      });

      // 3. Load active bookings from bookings collection to display booked days
      try {
        const bookSnap = await getDocs(collection(db, "bookings"));
        bookSnap.forEach((b) => {
          const bData = b.data();
          if (bData.status === "confirmed" || bData.status === "pending" || bData.status === "reschedule_requested") {
            const bookedDate = bData.slot?.date;
            const multiDates = bookedDate
              ? getConsecutiveDates(bookedDate, bData.multiDayCount || bData.answers?.multiDayCount)
              : [];

            multiDates.forEach((dt, idx) => {
              const existingIdx = blocked.findIndex((item) => item.date === dt);
              const bookingItem: BlockedDay = {
                date: dt,
                reason: `${bData.status === "confirmed" ? "Confirmed Shoot" : "Pending Hold"}: ${bData.customer?.name || "Client"} (${bData.sessionSnapshot?.name || "Shoot"}${idx > 0 ? ` - Day ${idx + 1}` : ""})`,
                isBooking: true,
                bookingId: b.id,
                bookingStatus: bData.status,
                clientName: bData.customer?.name || "Client",
                clientEmail: bData.customer?.email,
                sessionName: bData.sessionSnapshot?.name || "Photoshoot",
                dayIndex: idx + 1,
                totalDays: multiDates.length,
              };

              if (existingIdx >= 0) {
                blocked[existingIdx] = bookingItem;
              } else {
                blocked.push(bookingItem);
              }
            });

            if (bData.secondaryDate) {
              const secDate = bData.secondaryDate;
              const existingIdx = blocked.findIndex((item) => item.date === secDate);
              const secItem: BlockedDay = {
                date: secDate,
                reason: `${bData.status === "confirmed" ? "Confirmed Shoot" : "Pending Hold"} (Secondary Date): ${bData.customer?.name || "Client"}`,
                isBooking: true,
                bookingId: b.id,
                bookingStatus: bData.status,
                clientName: bData.customer?.name || "Client",
                clientEmail: bData.customer?.email,
                sessionName: bData.sessionSnapshot?.name || "Photoshoot",
                dayIndex: 2,
                totalDays: 2,
              };
              if (existingIdx >= 0) {
                blocked[existingIdx] = secItem;
              } else {
                blocked.push(secItem);
              }
            }
          }
        });
      } catch (bookErr) {
        console.warn("Could not load bookings into availability calendar:", bookErr);
      }

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

    const existingBlock = blockedDays.find((b) => b.date === dateStr);
    if (existingBlock) {
      if (existingBlock.isBooking) {
        // ACTIVE BOOKING DETECTED! DO NOT CASUALLY UNLOCK!
        setLockedBookingNotice(existingBlock);
        return;
      }
      // Manual block can be removed
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

      // 2. Fetch existing availability docs to delete any that were unblocked
      const existingSnap = await getDocs(collection(db, "availability"));
      const blockedDateSet = new Set(blockedDays.map((b) => b.date));
      for (const d of existingSnap.docs) {
        if (!blockedDateSet.has(d.id)) {
          await deleteDoc(d.ref);
        }
      }

      // 3. Save current blocked dates
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

              const blockItem = blockedDays.find((b) => b.date === dateStr);
              const isConfirmedBooking = blockItem?.isBooking && blockItem.bookingStatus === "confirmed";
              const isPendingBooking = blockItem?.isBooking && (blockItem.bookingStatus === "pending" || blockItem.bookingStatus === "reschedule_requested");
              const isManualBlock = blockItem && !blockItem.isBooking;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleToggleDay(day)}
                  className={`aspect-square rounded-2xl p-2 text-left flex flex-col justify-between transition-all border ${
                    isPast
                      ? "bg-[#f5f4ef]/60 border-[#e8e6df] text-[#a8a49c] cursor-not-allowed opacity-60 select-none"
                      : isConfirmedBooking
                      ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 hover:bg-emerald-100 shadow-sm"
                      : isPendingBooking
                      ? "bg-amber-50/90 border-amber-300 text-amber-950 hover:bg-amber-100"
                      : isManualBlock
                      ? "bg-red-50/80 border-red-200 text-red-900 hover:bg-red-100"
                      : isDayOff
                      ? "bg-stone-100/70 border-stone-200 text-stone-500"
                      : "bg-[#faf9f6] border-[#e8e6df] text-[#1c1b1a] hover:bg-[#f5f4ef] hover:border-[#1c1b1a]"
                  }`}
                  title={
                    isPast
                      ? "Date has passed (automatically locked)"
                      : blockItem?.reason
                      ? blockItem.reason
                      : isDayOff
                      ? "Closed day"
                      : "Click to lock date"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{day}</span>
                    {isConfirmedBooking && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-600 text-white">
                        {blockItem?.totalDays && blockItem.totalDays > 1 ? `D${blockItem.dayIndex || 1}` : "Shoot"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {isPast ? (
                      <Clock className="w-3.5 h-3.5 text-[#a8a49c]" />
                    ) : isConfirmedBooking ? (
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    ) : isPendingBooking ? (
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                    ) : isManualBlock ? (
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                    ) : isDayOff ? (
                      <span className="text-[9px] font-semibold text-stone-400">Off</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                    <span className="text-[9px] font-semibold truncate max-w-[42px] text-right">
                      {isPast
                        ? "Passed"
                        : isConfirmedBooking
                        ? "Booked"
                        : isPendingBooking
                        ? "Pending"
                        : isManualBlock
                        ? "Locked"
                        : isDayOff
                        ? "Closed"
                        : "Open"}
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
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span>Confirmed Shoot (Protected)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Pending Inquiry</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Manual Block</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span>Closed Day (Off)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#a8a49c]" />
              <span>Passed Dates</span>
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
      {/* Active Booking Protection Modal */}
      {lockedBookingNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1c1b1a]">Active Booking Protection</h3>
                <p className="text-xs text-[#7a766f]">Date {lockedBookingNotice.date} is strictly reserved</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#e8e6df] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8a867f]">Client Name:</span>
                <span className="font-semibold text-[#1c1b1a]">{lockedBookingNotice.clientName}</span>
              </div>
              {lockedBookingNotice.clientEmail && (
                <div className="flex justify-between">
                  <span className="text-[#8a867f]">Client Email:</span>
                  <span className="font-mono text-[#1c1b1a]">{lockedBookingNotice.clientEmail}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8a867f]">Session:</span>
                <span className="font-semibold text-[#1c1b1a]">{lockedBookingNotice.sessionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a867f]">Booking Status:</span>
                <span className="uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  {lockedBookingNotice.bookingStatus}
                </span>
              </div>
              {lockedBookingNotice.totalDays && lockedBookingNotice.totalDays > 1 && (
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>Multi-Day Event:</span>
                  <span>Day {lockedBookingNotice.dayIndex} of {lockedBookingNotice.totalDays}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Why is this date protected?</strong> Benedict Henry enforces a 1-shoot-per-day commitment. You cannot open this date for public booking while an active reservation exists. To change or free this date, reschedule or cancel the booking from the Bookings dashboard (which notifies the client by email).
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLockedBookingNotice(null)}
                className="px-4 py-2 rounded-xl border border-[#e6e4dc] text-xs font-semibold text-[#55524c] hover:bg-[#f5f4ef]"
              >
                Keep Date Locked
              </button>
              {lockedBookingNotice.bookingId && (
                <Link
                  href={`/admin/bookings?id=${lockedBookingNotice.bookingId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c1b1a] text-white text-xs font-bold hover:bg-black"
                >
                  <span>Go to Booking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
