"use client";

import { useId, useMemo, useRef, useState } from "react";
import {
  BOOKING_LEAD_DAYS,
  BOOKING_WINDOW_DAYS,
  getSlotsForDate,
  isDateBookable,
  toISODate,
} from "./availability";

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
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selectedDate ? new Date(`${selectedDate}T00:00:00`) : today)
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const slotsHeadingId = useId();

  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const minMonth = startOfMonth(today);
  const maxMonth = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + BOOKING_WINDOW_DAYS);
    return startOfMonth(d);
  }, [today]);

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
  const slots = selectedDateObj ? getSlotsForDate(selectedDateObj) : [];

  return (
    <div>
      <div className="rounded-2xl border border-ink/15 bg-paper p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 disabled:opacity-30 enabled:hover:border-ink"
          >
            ‹
          </button>
          <p id={headingId} className="font-display text-lg" aria-live="polite">
            {MONTH_FORMATTER.format(viewMonth)}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={!canGoNext}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 disabled:opacity-30 enabled:hover:border-ink"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-ink/50">
          {WEEKDAY_LABELS.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        <div ref={gridRef} role="grid" aria-labelledby={headingId} className="mt-1 grid grid-cols-7 gap-1">
          {days.map((date) => {
            const iso = toISODate(date);
            const inMonth = date.getMonth() === viewMonth.getMonth();
            const bookable = inMonth && isDateBookable(date, today);
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
                  className={`flex h-10 w-full items-center justify-center rounded-lg text-sm transition-colors ${
                    !inMonth ? "text-ink/20" : ""
                  } ${
                    isSelected
                      ? "bg-ink text-paper"
                      : bookable
                        ? "text-ink hover:bg-sand"
                        : "cursor-not-allowed text-ink/25 line-through"
                  } ${isToday && !isSelected ? "ring-1 ring-accent/50" : ""}`}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-ink/50">
          Earliest available date is {BOOKING_LEAD_DAYS} days out; bookable up to {BOOKING_WINDOW_DAYS} days ahead.
        </p>
        {dateError && (
          <p role="alert" className="mt-2 text-sm text-accentDark">
            {dateError}
          </p>
        )}
      </div>

      <div className="mt-5">
        <p id={slotsHeadingId} className="text-sm font-medium">
          {selectedDateObj ? `Available times — ${DAY_FORMATTER.format(selectedDateObj)}` : "Pick a date to see available times"}
        </p>

        {selectedDateObj && slots.length === 0 && (
          <p className="mt-2 text-sm text-ink/60">No slots left that day — try another date.</p>
        )}

        {selectedDateObj && slots.length > 0 && (
          <div
            role="group"
            aria-labelledby={slotsHeadingId}
            className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
          >
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectTime(slot.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/20 text-ink hover:border-ink"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}

        {timeError && (
          <p role="alert" className="mt-2 text-sm text-accentDark">
            {timeError}
          </p>
        )}
      </div>
    </div>
  );
}
