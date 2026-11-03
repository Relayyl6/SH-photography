// Booking-window and time-slot rules for the calendar picker.
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export type DayHours = { start: string; end: string } | null; // null = closed

// 0 = Sunday … 6 = Saturday.
export const DEFAULT_OPENING_HOURS: Record<number, DayHours> = {
  0: null, // Sunday default closed
  1: { start: "09:00", end: "18:00" },
  2: { start: "09:00", end: "18:00" },
  3: { start: "09:00", end: "18:00" },
  4: { start: "09:00", end: "18:00" },
  5: { start: "09:00", end: "18:00" },
  6: { start: "10:00", end: "16:00" },
};

export const SLOT_DURATION_MINUTES = 60;
export const BOOKING_LEAD_DAYS = 2; // earliest bookable day is today + 2
export const BOOKING_WINDOW_DAYS = 540; // 18 months ahead

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isDateBookable(
  date: Date,
  today: Date = new Date(),
  customBlockedDates?: string[],
  customHours?: Record<number, DayHours>
): boolean {
  const day = startOfDay(date);
  const earliest = startOfDay(today);
  earliest.setDate(earliest.getDate() + BOOKING_LEAD_DAYS);
  const latest = startOfDay(today);
  latest.setDate(latest.getDate() + BOOKING_WINDOW_DAYS);

  if (day < earliest || day > latest) return false;

  const hours = customHours ? customHours[day.getDay()] : DEFAULT_OPENING_HOURS[day.getDay()];
  if (hours === null || hours === undefined) return false;

  const iso = toISODate(day);
  if (customBlockedDates && customBlockedDates.includes(iso)) return false;

  return true;
}

export type TimeSlot = { value: string; label: string };

function formatLabel(hhmm: string): string {
  const [hStr = "0", mStr = "00"] = hhmm.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${mStr} ${period}`;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [hStr = "0", mStr = "00"] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function getSlotsForDate(
  date: Date,
  customHours?: Record<number, DayHours>,
  bookedTimes?: Set<string>
): TimeSlot[] {
  const hours = customHours ? customHours[date.getDay()] : DEFAULT_OPENING_HOURS[date.getDay()];
  if (!hours) return [];

  const slots: TimeSlot[] = [];
  let cursor = hours.start;

  while (cursor < hours.end) {
    if (!bookedTimes || !bookedTimes.has(cursor)) {
      slots.push({ value: cursor, label: formatLabel(cursor) });
    }
    cursor = addMinutes(cursor, SLOT_DURATION_MINUTES);
  }

  return slots;
}
