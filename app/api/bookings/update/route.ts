import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

    const docRef = doc(db, "bookings", actualBookingId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const currentBooking = snap.data();

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

      // If Benedict tries to confirm a booking, verify that this date/slot hasn't already been booked by another client!
      if (targetStatus === "confirmed" && currentBooking.slot?.date) {
        const conflict = await findSlotConflict(
          currentBooking.slot.date,
          currentBooking.slot.start || "10:00",
          currentBooking.slot.end || "11:30",
          actualBookingId
        );
        if (conflict) {
          return NextResponse.json(
            {
              error: `Cannot confirm: ${currentBooking.slot.date} (${currentBooking.slot.start} – ${currentBooking.slot.end}) is already booked by another confirmed reservation.`,
              conflictDetail: conflict.reason,
            },
            { status: 409 }
          );
        }
      }

      await updateDoc(docRef, {
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
      });

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
