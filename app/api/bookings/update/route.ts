import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

async function handleUpdate(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, customerUid, userUid, updates, slot, customer, answers } = body;

    const actualUid = customerUid || userUid;
    const actualBookingId = bookingId;

    if (!actualBookingId) {
      return NextResponse.json(
        { error: "Missing bookingId." },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection("bookings").doc(actualBookingId);
    const snap = await docRef.get();

    const cleanUpdates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    const targetSlot = updates?.slot || slot;
    const targetAnswers = updates?.answers || answers;
    const targetCustomer = updates?.customer || customer;

    if (targetSlot) cleanUpdates.slot = targetSlot;
    if (targetAnswers) cleanUpdates.answers = targetAnswers;
    if (targetCustomer) {
      if (snap.exists) {
        const existingCust = snap.data()?.customer || {};
        cleanUpdates.customer = { ...existingCust, ...targetCustomer };
      } else {
        cleanUpdates.customer = targetCustomer;
      }
    }

    if (snap.exists) {
      const data = snap.data();
      // Verify ownership if customerUid is passed
      if (actualUid && data?.customerUid && data.customerUid !== actualUid) {
        return NextResponse.json({ error: "Unauthorized to edit this booking." }, { status: 403 });
      }

      await docRef.update(cleanUpdates);
    } else {
      // Create if it doesn't exist yet (e.g. mock transition)
      await docRef.set({
        id: actualBookingId,
        customerUid: actualUid || null,
        ...cleanUpdates,
        createdAt: Date.now(),
        status: "pending",
      });
    }

    return NextResponse.json({ success: true, bookingId: actualBookingId });
  } catch (err: any) {
    console.error("Error updating booking:", err);
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
