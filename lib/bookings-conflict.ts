import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * Check if two time windows on the same date overlap.
 * Format expected: "HH:mm" (24-hour).
 */
export function isTimeOverlap(startA?: string, endA?: string, startB?: string, endB?: string): boolean {
  if (!startA || !startB) return true; // If time unspecified, assume full-day overlap
  const toMinutes = (t: string) => {
    const [h = "0", m = "0"] = t.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA || startA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB || startB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Check if a single target date and time slot has conflicting active bookings in Firestore.
 * Active bookings include:
 * 1. "confirmed" bookings (locked by brand owner Benedict)
 * 2. "pending" bookings (held pending review)
 * 3. "reschedule_requested" bookings (both previous dates and requested dates held)
 *
 * Automatically inspects primary date, multi-day additionalDates array, and secondaryDate.
 */
export async function findSlotConflict(
  targetDate: string,
  targetStart: string,
  targetEnd: string,
  excludeBookingId?: string
): Promise<{ conflictBookingId: string; reason: string } | null> {
  if (!targetDate) return null;

  try {
    const q = query(
      collection(db, "bookings"),
      where("status", "in", ["confirmed", "pending", "reschedule_requested"])
    );
    const snap = await getDocs(q);

    for (const d of snap.docs) {
      if (excludeBookingId && d.id === excludeBookingId) continue;
      const data = d.data();

      // Gather all booked dates for this active booking (primary + any multi-day dates)
      const activeDates: string[] = [];
      if (data.slot?.date) activeDates.push(data.slot.date);
      if (data.secondaryDate) activeDates.push(data.secondaryDate);
      if (Array.isArray(data.additionalDates)) {
        activeDates.push(...data.additionalDates.filter(Boolean));
      }
      if (Array.isArray(data.answers?.additionalDates)) {
        activeDates.push(...data.answers.additionalDates.filter(Boolean));
      }

      // Check if targetDate matches any of this booking's active confirmed/held dates
      for (const bookedDate of activeDates) {
        if (bookedDate === targetDate) {
          // If multi-day date, assume full-day block unless times match
          if (bookedDate === data.slot?.date) {
            if (isTimeOverlap(targetStart, targetEnd, data.slot?.start, data.slot?.end)) {
              return {
                conflictBookingId: d.id,
                reason: `Active ${data.status} booking #${d.id.substring(0, 8)} on ${bookedDate} (${data.slot?.start || "10:00"}–${data.slot?.end || "18:00"})`,
              };
            }
          } else {
            // Multi-day secondary or additional date is locked full day
            return {
              conflictBookingId: d.id,
              reason: `Active ${data.status} multi-day booking #${d.id.substring(0, 8)} locking ${bookedDate}`,
            };
          }
        }
      }

      // If booking is pending reschedule approval, also check the requestedSlot and requested additional dates
      if (data.pendingChangeRequest?.requestedSlot?.date === targetDate) {
        const reqSlot = data.pendingChangeRequest.requestedSlot;
        if (isTimeOverlap(targetStart, targetEnd, reqSlot.start, reqSlot.end)) {
          return {
            conflictBookingId: d.id,
            reason: `Pending reschedule request on booking #${d.id.substring(0, 8)} holding ${reqSlot.date} (${reqSlot.start || ""}–${reqSlot.end || ""})`,
          };
        }
      }

      if (Array.isArray(data.pendingChangeRequest?.requestedAdditionalDates)) {
        if (data.pendingChangeRequest.requestedAdditionalDates.includes(targetDate)) {
          return {
            conflictBookingId: d.id,
            reason: `Pending reschedule request on booking #${d.id.substring(0, 8)} holding multi-day date ${targetDate}`,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Slot conflict query error:", err);
  }

  return null;
}

/**
 * Check multiple dates for conflict all at once (useful for 2-day, 3-day, 4-day shoots).
 */
export async function checkAllDatesConflict(
  dates: string[],
  start: string,
  end: string,
  excludeBookingId?: string
): Promise<{ conflictDate: string; reason: string } | null> {
  for (const date of dates) {
    if (!date) continue;
    const conflict = await findSlotConflict(date, start, end, excludeBookingId);
    if (conflict) {
      return {
        conflictDate: date,
        reason: conflict.reason,
      };
    }
  }
  return null;
}
