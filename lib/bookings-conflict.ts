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
 * Check if a target date and time slot has conflicting active bookings in Firestore.
 * Active bookings include:
 * 1. "confirmed" bookings (confirmed slot is locked)
 * 2. "pending" bookings (pending slot is locked)
 * 3. "reschedule_requested" bookings:
 *    - Both current slot (original date) AND requestedSlot (pending approval date) are locked!
 *
 * @param targetDate "YYYY-MM-DD"
 * @param targetStart "HH:mm"
 * @param targetEnd "HH:mm"
 * @param excludeBookingId Optional booking ID to exclude from self-collision (e.g. when updating)
 * @returns Conflicting booking details if conflict exists, or null if slot is free
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

      // Check primary slot (date and time)
      if (data.slot?.date === targetDate) {
        if (isTimeOverlap(targetStart, targetEnd, data.slot.start, data.slot.end)) {
          return {
            conflictBookingId: d.id,
            reason: `Existing ${data.status} booking #${d.id.substring(0, 8)} (${data.slot.date} ${data.slot.start || ""}–${data.slot.end || ""})`,
          };
        }
      }

      // If booking is pending reschedule approval, also check the requestedSlot it is holding!
      if (data.pendingChangeRequest?.requestedSlot?.date === targetDate) {
        const reqSlot = data.pendingChangeRequest.requestedSlot;
        if (isTimeOverlap(targetStart, targetEnd, reqSlot.start, reqSlot.end)) {
          return {
            conflictBookingId: d.id,
            reason: `Pending reschedule request on booking #${d.id.substring(0, 8)} holding ${reqSlot.date} ${reqSlot.start || ""}–${reqSlot.end || ""}`,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Slot conflict query error:", err);
  }

  return null;
}
