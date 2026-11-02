import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { sendBookingNotifications } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, sessionName, date, timeSlot, customer, answers, customerUid } = body;

    if (!sessionId || !date || !customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: "Missing required booking details (session, date, customer name and email)." },
        { status: 400 }
      );
    }

    // Generate unique booking ID
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate cryptographic claim token for guest claiming
    const claimToken = crypto.randomBytes(24).toString("hex");
    const claimTokenHash = crypto.createHash("sha256").update(claimToken).digest("hex");

    const bookingDoc = {
      id: bookingId,
      sessionId,
      sessionSnapshot: {
        name: sessionName || sessionId,
        price: "Quote on Request",
        durationMinutes: 90,
      },
      slot: {
        date,
        start: timeSlot?.start || "10:00",
        end: timeSlot?.end || "11:30",
      },
      answers: answers || {},
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
      status: "pending",
      ownerNotes: [],
      customerUid: customerUid || null,
      claimTokenHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: customerUid ? "web" : "guest",
      emailStatus: {
        owner: "sent",
        customer: "sent",
      },
      statusHistory: [
        {
          status: "pending",
          by: customer.name,
          at: Date.now(),
        },
      ],
    };

    // 1. Save to Firestore DB first (Save before you send rule)
    await setDoc(doc(db, "bookings", bookingId), bookingDoc);

    // 2. Send emails to owner and customer via Gmail SMTP
    try {
      await sendBookingNotifications({
        bookingId,
        sessionId,
        sessionName: sessionName || sessionId,
        date,
        timeSlot: {
          start: timeSlot?.start || "10:00",
          end: timeSlot?.end || "11:30",
        },
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        answers,
      });
    } catch (emailErr) {
      console.error("Email notification dispatch error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      claimToken,
      booking: bookingDoc,
    });
  } catch (err: any) {
    console.error("Error creating booking:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process booking." },
      { status: 500 }
    );
  }
}
