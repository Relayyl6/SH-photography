import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claims, claimTokens, customerUid, customerEmail } = body;

    if (!customerUid) {
      return NextResponse.json(
        { error: "Invalid payload. Provide customerUid." },
        { status: 400 }
      );
    }

    const claimedIds: string[] = [];

    // Format 1: claims array of { bookingId, claimToken }
    if (Array.isArray(claims)) {
      for (const item of claims) {
        const { bookingId, claimToken } = item;
        if (!bookingId || !claimToken) continue;

        const hash = crypto.createHash("sha256").update(claimToken).digest("hex");

        try {
          const docRef = adminDb.collection("bookings").doc(bookingId);
          const snap = await docRef.get();

          if (snap.exists) {
            const data = snap.data();
            if (data?.claimTokenHash === hash || !data?.customerUid) {
              await docRef.update({
                customerUid,
                source: "claimed",
                updatedAt: Date.now(),
              });
              claimedIds.push(bookingId);
            }
          }
        } catch (e) {
          console.warn("Claim verification error:", e);
        }
      }
    }

    // Format 2: claimTokens array of token strings
    if (Array.isArray(claimTokens) && claimTokens.length > 0) {
      for (const token of claimTokens) {
        if (!token) continue;
        const hash = crypto.createHash("sha256").update(token).digest("hex");
        try {
          const snap = await adminDb
            .collection("bookings")
            .where("claimTokenHash", "==", hash)
            .get();

          for (const doc of snap.docs) {
            await doc.ref.update({
              customerUid,
              source: "claimed",
              updatedAt: Date.now(),
            });
            claimedIds.push(doc.id);
          }
        } catch (e) {
          console.warn("Token claim error:", e);
        }
      }
    }

    // Also claim any bookings that match customerEmail if customerUid was previously missing
    if (customerEmail) {
      try {
        const emailSnap = await adminDb
          .collection("bookings")
          .where("customer.email", "==", customerEmail.toLowerCase().trim())
          .get();

        for (const doc of emailSnap.docs) {
          const data = doc.data();
          if (!data.customerUid) {
            await doc.ref.update({
              customerUid,
              updatedAt: Date.now(),
            });
            if (!claimedIds.includes(doc.id)) {
              claimedIds.push(doc.id);
            }
          }
        }
      } catch (e) {
        console.warn("Email-based auto claim error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      claimedCount: claimedIds.length,
      claimedIds,
    });
  } catch (err: any) {
    console.error("Error in claim route:", err);
    return NextResponse.json(
      { error: err.message || "Failed to claim bookings." },
      { status: 500 }
    );
  }
}
