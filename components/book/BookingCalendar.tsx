"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  BOOKING_LEAD_DAYS,
  BOOKING_WINDOW_DAYS,
  getSlotsForDate,
  isDateBookable,
  toISODate,
  DayHours,
  DEFAULT_OPENING_HOURS,
  formatLabel,
} from "./availability";
import { db } from "@/lib/firebase/config";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Monday-first 6-week grid for the given month, including the leading/
// trailing days of neighbouring months needed to fill the rows.
function buildMonthGrid(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function parseTimeToMinutes(t: string): number {
  if (!t || typeof t !== "string") return 0;
  const parts = t.split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  return h * 60 + m;
}

export function BookingCalendar({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  dateError,
  timeError,
}: {
  selectedDate?: string; // ISO "YYYY-MM-DD"
  selectedTime?: string; // "HH:mm"
  onSelectDate: (iso: string) => void;
  onSelectTime: (time: string) => void;
  dateError?: string;
  timeError?: string;
}) {
  const today = useMemo(() => new Date(), []);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState<Record<string, string[]>>({});
  const [openingHours, setOpeningHours] = useState<Record<number, DayHours>>(DEFAULT_OPENING_HOURS);
  const [leadDays, setLeadDays] = useState(BOOKING_LEAD_DAYS);
  const [windowDays, setWindowDays] = useState(BOOKING_WINDOW_DAYS);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    let active = true;

    let currentAdminBlocked: string[] = [];
    let currentBookingList: any[] = [];
    let currentOpeningHours: Record<number, DayHours> = DEFAULT_OPENING_HOURS;

    function recalculateBookings() {
      if (!active) return;
      const slotMap: Record<string, string[]> = {};
      const fullDayDates: string[] = [];

      for (const bData of currentBookingList) {
        const bDate = bData.slot?.date;
        if (!bDate) continue;

        if (!slotMap[bDate]) slotMap[bDate] = [];

        const bStart = bData.slot?.start;
        const bEnd = bData.slot?.end;

        const sessName = String(bData.sessionSnapshot?.name || "").toLowerCase();
        const durationStr = String(bData.answers?.estimatedDuration || "").toLowerCase();

        // Check if full day / multi-day
        if (
          sessName.includes("full day") ||
          durationStr.includes("full day") ||
          durationStr.includes("multi-day") ||
          (bStart === "09:00" && (bEnd === "17:00" || bEnd === "18:00"))
        ) {
          if (!fullDayDates.includes(bDate)) fullDayDates.push(bDate);
        }

        if (bStart) {
          const sMins = parseTimeToMinutes(bStart);
          let eMins = bEnd ? parseTimeToMinutes(bEnd) : 0;
          if (eMins <= sMins) {
            if (durationStr.includes("30 min")) eMins = sMins + 30;
            else if (durationStr.includes("2 hr")) eMins = sMins + 120;
            else if (durationStr.includes("half day") || durationStr.includes("4 hr")) eMins = sMins + 240;
            else eMins = sMins + 60;
          }

          // Check every 60-min slot cursor from 07:00 to 21:00
          // A slot [slotStart, slotStart + 60] overlaps if max(slotStart, sMins) < min(slotStart + 60, eMins)
          for (let m = 7 * 60; m < 21 * 60; m += 60) {
            const slotStart = m;
            const slotEnd = m + 60;
            if (Math.max(slotStart, sMins) < Math.min(slotEnd, eMins)) {
              const hh = String(Math.floor(m / 60)).padStart(2, "0");
              const mm = String(m % 60).padStart(2, "0");
              const timeStr = `${hh}:${mm}`;
              if (!slotMap[bDate].includes(timeStr)) {
                slotMap[bDate].push(timeStr);
              }
            }
          }
        }

        if (bData.secondaryDate && !fullDayDates.includes(bData.secondaryDate)) {
          fullDayDates.push(bData.secondaryDate);
        }
        if (Array.isArray(bData.additionalDates)) {
          for (const addDate of bData.additionalDates) {
            if (addDate && !fullDayDates.includes(addDate)) {
              fullDayDates.push(addDate);
            }
          }
        }
      }

      // Check dates where all possible slots are taken
      const fullyBookedDates: string[] = [];
      for (const [dateStr, bookedSlots] of Object.entries(slotMap)) {
        const dObj = new Date(`${dateStr}T00:00:00`);
        if (!isNaN(dObj.getTime())) {
          const dayHours = currentOpeningHours[dObj.getDay()];
          if (dayHours) {
            const allPossibleSlots = getSlotsForDate(dObj, currentOpeningHours);
            if (allPossibleSlots.length > 0 && allPossibleSlots.every((s) => bookedSlots.includes(s.value))) {
              fullyBookedDates.push(dateStr);
            }
          }
        }
      }

      const mergedBlocked = Array.from(new Set([...currentAdminBlocked, ...fullDayDates, ...fullyBookedDates]));
      setBlockedDates(mergedBlocked);
      setBookedSlotsByDate(slotMap);
    }

    // 1. Settings / Availability Listener (Weekly schedules & closed days)
    const unsubAvailSettings = onSnapshot(
      doc(db, "settings", "availability"),
      (snap) => {
        if (!active) return;
        setIsLiveConnected(true);
        if (snap.exists()) {
          const sData = snap.data();
          const sched = sData.weeklySchedule;
          if (sched) {
            const mapped: Record<number, DayHours> = {
              0: sched.sunday?.open ? { start: sched.sunday.start, end: sched.sunday.end } : null,
              1: sched.monday?.open ? { start: sched.monday.start, end: sched.monday.end } : null,
              2: sched.tuesday?.open ? { start: sched.tuesday.start, end: sched.tuesday.end } : null,
              3: sched.wednesday?.open ? { start: sched.wednesday.start, end: sched.wednesday.end } : null,
              4: sched.thursday?.open ? { start: sched.thursday.start, end: sched.thursday.end } : null,
              5: sched.friday?.open ? { start: sched.friday.start, end: sched.friday.end } : null,
              6: sched.saturday?.open ? { start: sched.saturday.start, end: sched.saturday.end } : null,
            };
            if (Array.isArray(sData.alwaysClosedDays)) {
              const dayNameToIndex: Record<string, number> = {
                sunday: 0,
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6,
              };
              for (const closedDay of sData.alwaysClosedDays) {
                const idx = dayNameToIndex[closedDay.toLowerCase()];
                if (idx !== undefined) mapped[idx] = null;
              }
            }
            currentOpeningHours = mapped;
            setOpeningHours(mapped);
            recalculateBookings();
          }
        }
      },
      (err) => console.warn("Live settings/availability sync error:", err)
    );

    // 2. Settings / Booking Policies Listener (Lead times & Max window)
    const unsubBookingSettings = onSnapshot(
      doc(db, "settings", "booking"),
      (snap) => {
        if (!active) return;
        if (snap.exists()) {
          const bData = snap.data();
          if (typeof bData.leadTimeHours === "number") {
            setLeadDays(Math.max(1, Math.ceil(bData.leadTimeHours / 24)));
          }
          if (typeof bData.maxAdvanceDays === "number") {
            setWindowDays(bData.maxAdvanceDays);
          }
        }
      },
      (err) => console.warn("Live settings/booking sync error:", err)
    );

    // 3. Availability overrides collection (Admin locked dates)
    const unsubAvailability = onSnapshot(
      collection(db, "availability"),
      (snap) => {
        if (!active) return;
        const blocked: string[] = [];
        snap.forEach((d) => {
          if (d.data().isOpen === false) {
            blocked.push(d.id);
          }
        });
        currentAdminBlocked = blocked;
        recalculateBookings();
      },
      (err) => console.warn("Live availability collection sync error:", err)
    );

    // 4. Bookings collection listener (Live client reservations)
    const unsubBookings = onSnapshot(
      collection(db, "bookings"),
      (snap) => {
        if (!active) return;
        const list: any[] = [];
        snap.forEach((d) => {
          const bData = d.data();
          if (bData.status === "confirmed" || bData.status === "pending" || bData.status === "reschedule_requested") {
            list.push(bData);
          }
        });
        currentBookingList = list;
        recalculateBookings();
      },
      (err) => console.warn("Live bookings sync error:", err)
    );

    return () => {
      active = false;
      unsubAvailSettings();
      unsubBookingSettings();
      unsubAvailability();
      unsubBookings();
    };
  }, []);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selectedDate ? new Date(`${selectedDate}T00:00:00`) : today)
  );

  // Keep calendar month view aligned whenever a date is selected or autofilled by AI
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(`${selectedDate}T00:00:00`);
      if (!isNaN(d.getTime())) {
        setViewMonth(startOfMonth(d));
      }
    }
  }, [selectedDate]);

  const gridRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const slotsHeadingId = useId();

  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const minMonth = startOfMonth(today);
  const maxMonth = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + windowDays);
    return startOfMonth(d);
  }, [today, windowDays]);

  const canGoPrev = viewMonth > minMonth;
  const canGoNext = viewMonth < maxMonth;

  function changeMonth(offset: number) {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));
  }

  function focusDay(iso: string) {
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`)?.focus();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, date: Date) {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = deltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = new Date(date);
    next.setDate(date.getDate() + delta);
    if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) {
      setViewMonth(startOfMonth(next));
    }
    focusDay(toISODate(next));
  }

  const selectedDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
  const bookedTimesSet = selectedDate ? new Set(bookedSlotsByDate[selectedDate] || []) : undefined;
  const slots = selectedDateObj ? getSlotsForDate(selectedDateObj, openingHours, bookedTimesSet) : [];
  const selectedDayHours = selectedDateObj ? openingHours[selectedDateObj.getDay()] : null;

  return (
    <div className="rounded-2xl border border-ink/15 bg-paper p-4 sm:p-6 shadow-xs">
      {/* Live sync status header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isLiveConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Live Studio Availability
          </span>
        </div>
        <span className="text-[11px] text-ink/50 hidden sm:inline">
          Syncs with Admin Schedule
        </span>
      </div>

      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 disabled:opacity-30 enabled:hover:border-ink transition-colors"
        >
          ‹
        </button>
        <p id={headingId} className="font-display text-lg tracking-tight font-medium" aria-live="polite">
          {MONTH_FORMATTER.format(viewMonth)}
        </p>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 disabled:opacity-30 enabled:hover:border-ink transition-colors"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-ink/50">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div ref={gridRef} role="grid" aria-labelledby={headingId} className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const iso = toISODate(date);
          const inMonth = date.getMonth() === viewMonth.getMonth();
          const bookable = inMonth && isDateBookable(date, today, blockedDates, openingHours, leadDays, windowDays);
          const isSelected = selectedDate === iso;
          const isToday = toISODate(today) === iso;

          return (
            <div key={iso} role="gridcell">
              <button
                type="button"
                data-iso={iso}
                tabIndex={isSelected || (!selectedDate && isToday) ? 0 : -1}
                disabled={!bookable}
                aria-current={isToday ? "date" : undefined}
                aria-selected={isSelected}
                aria-label={`${DAY_FORMATTER.format(date)}${bookable ? "" : " — not available"}`}
                onClick={() => bookable && onSelectDate(iso)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  !inMonth ? "text-ink/20" : ""
                } ${
                  isSelected
                    ? "bg-ink text-paper shadow-sm"
                    : bookable
                      ? "text-ink hover:bg-sand/60"
                      : "cursor-not-allowed text-ink/25 line-through decoration-ink/40"
                } ${isToday && !isSelected ? "ring-1 ring-accent/60" : ""}`}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      {/* Lead time & policy explanation */}
      <p className="mt-3 text-xs text-ink/50">
        Earliest available date is {leadDays} days out; bookable up to {windowDays} days ahead.
      </p>

      {dateError && (
        <p role="alert" className="mt-2 text-sm text-accentDark font-medium">
          {dateError}
        </p>
      )}

      {/* Available Time Slots Section (Integrated inside the card for optimal UX) */}
      <div className="mt-6 border-t border-ink/10 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div>
            <p id={slotsHeadingId} className="text-sm font-medium text-ink flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ink/70" />
              {selectedDateObj
                ? `Available Times — ${DAY_FORMATTER.format(selectedDateObj)}`
                : "Pick a date above to view shoot times"}
            </p>
            {selectedDayHours && (
              <p className="text-xs text-ink/60 mt-0.5">
                Studio shoot hours: {selectedDayHours.start} – {selectedDayHours.end} (Manchester GMT)
              </p>
            )}
          </div>
          {selectedTime && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Selected: {formatLabel(selectedTime)}
            </span>
          )}
        </div>

        {!selectedDateObj ? (
          <p className="text-xs text-ink/50 py-3 text-center sm:text-left">
            Select an open date on the calendar above to choose a shoot time.
          </p>
        ) : slots.length === 0 ? (
          <div className="rounded-xl bg-sand/40 border border-ink/10 p-3 text-xs text-ink/70 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accentDark shrink-0" />
            <span>All shoot slots for this day are fully reserved. Please choose another date.</span>
          </div>
        ) : (
          <div
            role="group"
            aria-labelledby={slotsHeadingId}
            className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
          >
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectTime(slot.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-ink bg-ink text-paper shadow-sm"
                      : "border-ink/20 text-ink bg-paper hover:border-ink hover:bg-sand/30"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}

        {timeError && (
          <p role="alert" className="mt-2 text-xs text-accentDark font-medium">
            {timeError}
          </p>
        )}
      </div>
    </div>
  );
}
