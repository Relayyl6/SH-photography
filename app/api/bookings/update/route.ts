import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { getAdminDb } from "@/lib/firebase/admin";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { sendRescheduleRequestNotification, sendRescheduleDecisionNotification } from "@/lib/email";
import { findSlotConflict } from "@/lib/bookings-conflict";

export const dynamic = "force-dynamic";

async function handleUpdate(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action, // "request_change" | "approve_change" | "decline_change" | "set_status"
      bookingId,
      customerUid,
      userUid,
      newStatus,
      slot,
      customer,
      answers,
      ownerMessage,
    } = body;

    const actualUid = customerUid || userUid;
    const actualBookingId = bookingId;

    if (!actualBookingId) {
      return NextResponse.json({ error: "Missing bookingId." }, { status: 400 });
    }

    // 0. DELETE BOOKING (Admin Delete)
    if (action === "delete") {
      try {
        const adminDb = getAdminDb();
        if (adminDb) {
          await adminDb.collection("bookings").doc(actualBookingId).delete();
        } else if (db && typeof (db as any).type === "string") {
          const docRef = doc(db, "bookings", actualBookingId);
          await deleteDoc(docRef);
        }
      } catch (delErr) {
        console.warn("Delete in Firestore caught:", delErr);
      }
      return NextResponse.json({ success: true, action: "deleted", bookingId: actualBookingId });
    }

    const docRef = doc(db, "bookings", actualBookingId);

    const snap = await getDoc(docRef);

    // 0.5 ADMIN DIRECT RESCHEDULE / UPDATE
    if (action === "reschedule") {
      const {
        newDate,
        newStart,
        newEnd,
        customerName,
        customerEmail,
        customerPhone,
        location,
        notes,
        secondaryDate,
        notifyClient,
        bookingFallback,
      } = body;

      const current = snap.exists() ? snap.data() : (bookingFallback || {});
      const targetDate = newDate || current.slot?.date;
      const targetStart = newStart || current.slot?.start || "10:00";
      const targetEnd = newEnd || current.slot?.end || "11:30";

      const updatedSlot = {
        date: targetDate,
        start: targetStart,
        end: targetEnd,
      };

      const updatedCustomer = {
        ...(current.customer || {}),
        ...(customerName ? { name: customerName } : {}),
        ...(customerEmail ? { email: customerEmail } : {}),
        ...(customerPhone ? { phone: customerPhone } : {}),
      };

      const updatedAnswers = {
        ...(current.answers || {}),
        ...(location ? { location } : {}),
        ...(notes ? { notes } : {}),
      };

      const payload = {
        ...current,
        id: actualBookingId,
        slot: updatedSlot,
        customer: updatedCustomer,
        answers: updatedAnswers,
        ...(secondaryDate ? { secondaryDate, isDoubleDate: true } : {}),
        status: current.status === "reschedule_requested" ? "confirmed" : (current.status || "confirmed"),
        pendingChangeRequest: null,
        updatedAt: Date.now(),
        statusHistory: [
          ...(current.statusHistory || []),
          {
            status: current.status || "confirmed",
            by: "Benedict Henry (Admin Rescheduled)",
            at: Date.now(),
          },
        ],
      };

      const adminDb = getAdminDb();
      if (adminDb) {
        await adminDb.collection("bookings").doc(actualBookingId).set(payload, { merge: true });
      } else {
        await setDoc(docRef, payload, { merge: true });
      }

      if (notifyClient && updatedCustomer.email) {
        try {
          await sendRescheduleDecisionNotification({
            bookingId: actualBookingId,
            sessionName: current.sessionSnapshot?.name || "Photography Session",
            status: "approved",
            slot: updatedSlot,
            customer: {
              name: updatedCustomer.name || "Client",
              email: updatedCustomer.email,
            },
            ownerMessage: "Your photoshoot schedule has been updated by Benedict Henry at SH Photography.",
          });
        } catch (mailErr) {
          console.warn("Failed to send reschedule email to client:", mailErr);
        }
      }

      return NextResponse.json({
        success: true,
        action: "rescheduled",
        bookingId: actualBookingId,
        updatedBooking: payload,
      });
    }

    const currentBooking = snap.exists()
      ? snap.data()
      : (body.bookingFallback || {
          id: actualBookingId,
          status: "pending",
          slot: { date: "2026-11-20", start: "10:00", end: "11:30" },
          customer: { name: "Client", email: "" },
        });

    // 1. OWNER APPROVAL OF RESCHEDULE REQUEST
    if (action === "approve_change") {
      const changeReq = currentBooking.pendingChangeRequest;
      if (!changeReq || !changeReq.requestedSlot) {
        return NextResponse.json({ error: "No pending change request to approve." }, { status: 400 });
      }

      const reqSlot = changeReq.requestedSlot;

      // Verify slot is STILL free (no double booking allowed even when Benedict approves)
      const conflict = await findSlotConflict(reqSlot.date, reqSlot.start, reqSlot.end, actualBookingId);
      if (conflict) {
        return NextResponse.json(
          {
            error: `Cannot confirm reschedule: ${reqSlot.date} (${reqSlot.start} – ${reqSlot.end}) has already been booked by another client.`,
            conflictDetail: conflict.reason,
          },
          { status: 409 }
        );
      }

      const updatedSlot = reqSlot;
      const updatedAnswers = { ...currentBooking.answers };
      if (changeReq.requestedLocation) updatedAnswers.location = changeReq.requestedLocation;
      if (changeReq.requestedNotes) updatedAnswers.notes = changeReq.requestedNotes;

      const updatedCustomer = { ...currentBooking.customer };
      if (changeReq.requestedPhone) updatedCustomer.phone = changeReq.requestedPhone;

      await updateDoc(docRef, {
        slot: updatedSlot,
        answers: updatedAnswers,
        customer: updatedCustomer,
        status: "confirmed",
        pendingChangeRequest: null,
        updatedAt: Date.now(),
        statusHistory: [
          ...(currentBooking.statusHistory || []),
          {
            status: "confirmed",
            by: "Benedict Henry (Owner - Approved Reschedule)",
            at: Date.now(),
          },
        ],
      });

      // Dispatch confirmation email to client
      try {
        await sendRescheduleDecisionNotification({
          bookingId: actualBookingId,
          sessionName: currentBooking.sessionSnapshot?.name || "Session",
          status: "approved",
          slot: updatedSlot,
          customer: {
            name: currentBooking.customer?.name || "Valued Client",
            email: currentBooking.customer?.email,
          },
          ownerMessage,
        });
      } catch (err) {
        console.error("Failed to send approval email:", err);
      }

      return NextResponse.json({ success: true, bookingId: actualBookingId, status: "confirmed", slot: updatedSlot });
    }

    // 2. OWNER DECLINE OF RESCHEDULE REQUEST
    if (action === "decline_change") {
      await updateDoc(docRef, {
        status: "confirmed",
        pendingChangeRequest: null,
        updatedAt: Date.now(),
        statusHistory: [
          ...(currentBooking.statusHistory || []),
          {
            status: "confirmed",
            by: "Benedict Henry (Owner - Declined Reschedule)",
            at: Date.now(),
          },
        ],
      });

      // Dispatch decline email to client
      try {
        await sendRescheduleDecisionNotification({
          bookingId: actualBookingId,
          sessionName: currentBooking.sessionSnapshot?.name || "Session",
          status: "declined",
          slot: currentBooking.slot,
          customer: {
            name: currentBooking.customer?.name || "Valued Client",
            email: currentBooking.customer?.email,
          },
          ownerMessage,
        });
      } catch (err) {
        console.error("Failed to send decline email:", err);
      }

      return NextResponse.json({ success: true, bookingId: actualBookingId, status: "confirmed" });
    }

    // 3. OWNER UPDATES STATUS (e.g. Confirming a pending booking)
    if (action === "set_status") {
      const targetStatus = newStatus || body.status;
      if (!targetStatus) {
        return NextResponse.json({ error: "Missing new status." }, { status: 400 });
      }

      // If Benedict tries to confirm a booking, verify that none of its dates are already booked!
      if (targetStatus === "confirmed") {
        const allDatesToCheck: string[] = [];
        if (currentBooking.slot?.date) allDatesToCheck.push(currentBooking.slot.date);
        if (currentBooking.secondaryDate) allDatesToCheck.push(currentBooking.secondaryDate);
        if (Array.isArray(currentBooking.additionalDates)) {
          allDatesToCheck.push(...currentBooking.additionalDates.filter(Boolean));
        }

        for (const dateToCheck of allDatesToCheck) {
          const conflict = await findSlotConflict(
            dateToCheck,
            currentBooking.slot?.start || "10:00",
            currentBooking.slot?.end || "11:30",
            actualBookingId
          );
          if (conflict) {
            return NextResponse.json(
              {
                error: `Cannot confirm: ${dateToCheck} is already booked or held by another reservation.`,
                conflictDetail: conflict.reason,
              },
              { status: 409 }
            );
          }
        }
      }

      try {
        const adminDb = getAdminDb();
        if (adminDb) {
          await adminDb.collection("bookings").doc(actualBookingId).set({
            ...currentBooking,
            status: targetStatus,
            updatedAt: Date.now(),
            statusHistory: [
              ...(currentBooking.statusHistory || []),
              {
                status: targetStatus,
                by: "Benedict Henry (Owner)",
                at: Date.now(),
              },
            ],
          }, { merge: true });
        } else {
          await setDoc(docRef, {
            ...currentBooking,
            status: targetStatus,
            updatedAt: Date.now(),
            statusHistory: [
              ...(currentBooking.statusHistory || []),
              {
                status: targetStatus,
                by: "Benedict Henry (Owner)",
                at: Date.now(),
              },
            ],
          }, { merge: true });
        }
      } catch (dbErr) {
        console.warn("Status update in Firestore warning:", dbErr);
      }

      return NextResponse.json({ success: true, bookingId: actualBookingId, status: targetStatus });
    }

    // 4. CUSTOMER SUBMITS RESCHEDULE / CHANGE REQUEST ("REQUEST CHANGE")
    // Verify client authorization if userUid provided
    if (actualUid && currentBooking.customerUid && currentBooking.customerUid !== actualUid) {
      return NextResponse.json({ error: "Unauthorized to request changes on this booking." }, { status: 403 });
    }

    // Completed or cancelled bookings cannot be rescheduled
    if (currentBooking.status === "cancelled" || currentBooking.status === "completed") {
      return NextResponse.json(
        { error: `This booking is ${currentBooking.status} and cannot be rescheduled.` },
        { status: 400 }
      );
    }

    const requestedSlot = slot || currentBooking.slot;
    const requestedLocation = answers?.location || answers?.venue || currentBooking.answers?.location || "";
    const requestedNotes = answers?.notes || answers?.vision || currentBooking.answers?.notes || "";
    const requestedPhone = customer?.phone || currentBooking.customer?.phone || "";

    // STRICT CHECK: Do not allow rescheduling to a date/slot that is already booked!
    const conflict = await findSlotConflict(
      requestedSlot.date,
      requestedSlot.start || "10:00",
      requestedSlot.end || "11:30",
      actualBookingId
    );
    if (conflict) {
      return NextResponse.json(
        {
          error: `The requested date (${requestedSlot.date} at ${requestedSlot.start}) is already booked or held for another session. Please select another date or time.`,
          conflictDetail: conflict.reason,
        },
        { status: 409 }
      );
    }

    // Store pendingChangeRequest and set status to 'reschedule_requested'
    // Both original date AND requested date remain held/blocked until Benedict confirms
    const pendingChangeRequest = {
      requestedSlot,
      requestedLocation,
      requestedNotes,
      requestedPhone,
      requestedAt: Date.now(),
    };

    await updateDoc(docRef, {
      status: "reschedule_requested",
      pendingChangeRequest,
      updatedAt: Date.now(),
      statusHistory: [
        ...(currentBooking.statusHistory || []),
        {
          status: "reschedule_requested",
          by: `${currentBooking.customer?.name || "Client"} (Requested Change)`,
          at: Date.now(),
        },
      ],
    });

    // Send email alert to brand owner for manual review and confirmation
    try {
      await sendRescheduleRequestNotification({
        bookingId: actualBookingId,
        sessionName: currentBooking.sessionSnapshot?.name || "Photography Session",
        currentSlot: currentBooking.slot,
        requestedSlot,
        requestedLocation,
        requestedPhone,
        requestedNotes,
        customer: {
          name: currentBooking.customer?.name || "Client",
          email: currentBooking.customer?.email,
          phone: requestedPhone,
        },
      });
    } catch (err) {
      console.error("Failed to send reschedule request notification to owner:", err);
    }

    return NextResponse.json({
      success: true,
      bookingId: actualBookingId,
      status: "reschedule_requested",
      requiresApproval: true,
      pendingChangeRequest,
    });
  } catch (err: any) {
    console.error("Error in booking update route:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update booking." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleUpdate(req);
}

export async function PATCH(req: NextRequest) {
  return handleUpdate(req);
}
