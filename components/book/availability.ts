// Booking-window and time-slot rules for the calendar picker.
//
// None of this was specified by the client — it's a [SUGGESTED] sensible
// default, deliberately kept in one small config object so Benedict (or a
// developer) can tune it in minutes. Nothing here invents real bookings:
// `getBookedTimes` returns an empty set until a real calendar/DB is wired
// up (see the TODO below) — until then every slot in business hours shows
// as open, which is honest (AGENTS.md "prefer the option that shows less /
// hide, don't show" doesn't apply here since no fake scarcity is shown
// either way).

export type DayHours = { start: string; end: string } | null; // null = closed

// 0 = Sunday … 6 = Saturday. Sundays open for weddings & bespoke sessions.
export const OPENING_HOURS: Record<number, DayHours> = {
  0: { start: "10:00", end: "16:00" },
  1: { start: "09:00", end: "17:00" },
  2: { start: "09:00", end: "17:00" },
  3: { start: "09:00", end: "17:00" },
  4: { start: "09:00", end: "17:00" },
  5: { start: "09:00", end: "17:00" },
  6: { start: "10:00", end: "16:00" },
};

export const SLOT_DURATION_MINUTES = 60; // [SUGGESTED]
export const BOOKING_LEAD_DAYS = 2; // earliest bookable day is today + 2
export const BOOKING_WINDOW_DAYS = 540; // 18 months ahead (essential for weddings & future events)

// [PLACEHOLDER] specific dates Benedict is closed (holidays, already booked
// elsewhere) — add ISO "YYYY-MM-DD" strings here until this reads from a
// real calendar.
export const BLOCKED_DATES: string[] = [];

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

export function isDateBookable(date: Date, today: Date = new Date()): boolean {
  const day = startOfDay(date);
  const earliest = startOfDay(today);
  earliest.setDate(earliest.getDate() + BOOKING_LEAD_DAYS);
  const latest = startOfDay(today);
  latest.setDate(latest.getDate() + BOOKING_WINDOW_DAYS);

  if (day < earliest || day > latest) return false;
  if (OPENING_HOURS[day.getDay()] === null) return false;
  if (BLOCKED_DATES.includes(toISODate(day))) return false;
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
  const [hStr = "0", mStr = "0"] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

// TODO (once `enquiries`/a bookings table exists): look up confirmed or
// pending bookings for this ISO date and return their start times here so
// the UI can grey them out. Today this always returns an empty set.
export function getBookedTimes(_isoDate: string): Set<string> {
  return new Set();
}

export function getSlotsForDate(date: Date): TimeSlot[] {
  const hours = OPENING_HOURS[date.getDay()];
  if (!hours) return [];

  const booked = getBookedTimes(toISODate(date));
  const slots: TimeSlot[] = [];
  let cursor = hours.start;

  while (cursor < hours.end) {
    if (!booked.has(cursor)) {
      slots.push({ value: cursor, label: formatLabel(cursor) });
    }
    cursor = addMinutes(cursor, SLOT_DURATION_MINUTES);
  }

  return slots;
}
