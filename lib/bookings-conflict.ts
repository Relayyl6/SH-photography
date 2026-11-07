import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getConsecutiveDates } from "./date-utils";

export { getConsecutiveDates };

/**
 * Check if a single target date has conflicting active bookings in Firestore.
 * Active bookings include:
 * 1. "confirmed" bookings (locked by brand owner Benedict)
 * 2. "pending" bookings (held pending review)
 * 3. "reschedule_requested" bookings (both previous dates and requested dates held)
 *
 * Benedict Henry accepts ONE major photoshoot per day. Any overlap on date or multi-day range is locked.
 */
export async function findSlotConflict(
  targetDate: string,
  targetStart?: string,
  targetEnd?: string,
  excludeBookingId?: string
): Promise<{ conflictBookingId: string; reason: string } | null> {
  if (!targetDate) return null;

  try {
    let docs: Array<{ id: string; data: () => any }> = [];

    // 1. Try server Admin DB if available
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const adminDb = getAdminDb();
      if (adminDb) {
        const snap = await adminDb
          .collection("bookings")
          .where("status", "in", ["confirmed", "pending", "reschedule_requested"])
          .get();
        docs = snap.docs;
      }
    } catch {
      // Fallback to client SDK
    }

    // 2. Client SDK fallback
    if (docs.length === 0) {
      const q = query(
        collection(db, "bookings"),
        where("status", "in", ["confirmed", "pending", "reschedule_requested"])
      );
      const snap = await getDocs(q);
      docs = snap.docs;
    }

    for (const d of docs) {
      if (excludeBookingId && d.id === excludeBookingId) continue;
      const data = d.data();

      // Gather all booked dates for this active booking
      const activeDates = new Set<string>();

      // A. Primary date and any consecutive dates from multiDayCount
      if (data.slot?.date) {
        const multiDates = getConsecutiveDates(data.slot.date, data.multiDayCount || data.answers?.multiDayCount);
        multiDates.forEach((dt) => activeDates.add(dt));
      }

      // B. Secondary date (double date)
      if (data.secondaryDate) {
        activeDates.add(data.secondaryDate);
      }
      if (data.answers?.secondaryDate) {
        activeDates.add(data.answers.secondaryDate);
      }

      // C. Additional dates array
      if (Array.isArray(data.additionalDates)) {
        data.additionalDates.filter(Boolean).forEach((dt: string) => activeDates.add(dt));
      }
      if (Array.isArray(data.answers?.additionalDates)) {
        data.answers.additionalDates.filter(Boolean).forEach((dt: string) => activeDates.add(dt));
      }

      // D. Check if targetDate matches any of these active dates
      if (activeDates.has(targetDate)) {
        const clientName = data.customer?.name || "Client";
        const sessionName = data.sessionSnapshot?.name || "Photoshoot";
        return {
          conflictBookingId: d.id,
          reason: `${data.status.toUpperCase()} event on ${targetDate} for ${clientName} (${sessionName} #${d.id.substring(0, 8)})`,
        };
      }

      // E. Check pending reschedule requests
      if (data.pendingChangeRequest?.requestedSlot?.date) {
        const reqDate = data.pendingChangeRequest.requestedSlot.date;
        if (reqDate === targetDate) {
          return {
            conflictBookingId: d.id,
            reason: `Pending reschedule request holding ${targetDate} for ${data.customer?.name || "Client"}`,
          };
        }
      }

      if (Array.isArray(data.pendingChangeRequest?.requestedAdditionalDates)) {
        if (data.pendingChangeRequest.requestedAdditionalDates.includes(targetDate)) {
          return {
            conflictBookingId: d.id,
            reason: `Pending reschedule request holding multi-day date ${targetDate}`,
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
 * Check multiple dates for conflict all at once (useful for 2-day, 3-day shoots).
 */
export async function checkAllDatesConflict(
  dates: string[],
  start?: string,
  end?: string,
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
