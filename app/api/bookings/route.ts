import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { sendBookingNotifications } from "@/lib/email";
import { findSlotConflict } from "@/lib/bookings-conflict";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      sessionName,
      date,
      timeSlot,
      customer,
      answers = {},
      customerUid,
      isDoubleDate,
      secondaryDate,
      extraInfo,
    } = body;

    if (!sessionId || !date || !customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: "Missing required booking details (session, date, customer name and email)." },
        { status: 400 }
      );
    }

    const start = timeSlot?.start || "10:00";
    const end = timeSlot?.end || "11:30";

    // 1. Check slot conflict for primary date
    const conflict = await findSlotConflict(date, start, end);
    if (conflict) {
      return NextResponse.json(
        {
          error: `The selected date (${date} at ${start}) is already booked or held. Please select another date or time slot.`,
          conflictDetail: conflict.reason,
        },
        { status: 409 }
      );
    }

    // 2. If double date or multi-day requested, check conflicts for all additional dates
    const hasDoubleDate = Boolean(isDoubleDate || answers.isDoubleDate);
    const secDate = secondaryDate || answers.secondaryDate || null;
    if (hasDoubleDate && secDate) {
      const secConflict = await findSlotConflict(secDate, start, end);
      if (secConflict) {
        return NextResponse.json(
          {
            error: `The secondary date (${secDate} at ${start}) is already booked. Please choose another secondary date.`,
            conflictDetail: secConflict.reason,
          },
          { status: 409 }
        );
      }
    }

    const additionalDates: string[] = Array.isArray(body.additionalDates)
      ? body.additionalDates.filter(Boolean)
      : [];

    for (const addDate of additionalDates) {
      if (addDate === date || addDate === secDate) continue;
      const addConflict = await findSlotConflict(addDate, start, end);
      if (addConflict) {
        return NextResponse.json(
          {
            error: `The multi-day date (${addDate}) is already booked. Please choose another date.`,
            conflictDetail: addConflict.reason,
          },
          { status: 409 }
        );
      }
    }

    // Generate unique booking ID
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate cryptographic claim token for guest claiming
    const claimToken = crypto.randomBytes(24).toString("hex");
    const claimTokenHash = crypto.createHash("sha256").update(claimToken).digest("hex");

    const allMultiDates = Array.from(
      new Set([...(secDate ? [secDate] : []), ...additionalDates])
    );

    const enrichedAnswers = {
      ...answers,
      ...(hasDoubleDate ? { isDoubleDate: true, secondaryDate: secDate } : {}),
      ...(allMultiDates.length > 0 ? { additionalDates: allMultiDates } : {}),
      ...(body.multiDayCount ? { multiDayCount: body.multiDayCount } : {}),
      ...(extraInfo || answers.extraInfo ? { extraInfo: extraInfo || answers.extraInfo } : {}),
    };

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
        start,
        end,
      },
      isDoubleDate: hasDoubleDate,
      secondaryDate: secDate,
      multiDayCount: body.multiDayCount || (hasDoubleDate ? "2 Days" : null),
      additionalDates: allMultiDates,
      extraInfo: extraInfo || answers.extraInfo || null,
      answers: enrichedAnswers,
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

    // 3. Save to Firestore DB first (Save before you send rule)
    await setDoc(doc(db, "bookings", bookingId), bookingDoc);

    // 4. Send emails to owner and customer via Gmail SMTP
    try {
      await sendBookingNotifications({
        bookingId,
        sessionId,
        sessionName: sessionName || sessionId,
        date,
        timeSlot: { start, end },
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        answers: enrichedAnswers,
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
