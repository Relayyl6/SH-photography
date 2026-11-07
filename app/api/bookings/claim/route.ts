import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { claims, claimTokens, bookingIds, customerUid, customerEmail, bookingId } = body;

    if (!customerUid) {
      return NextResponse.json(
        { error: "Invalid payload. Provide customerUid." },
        { status: 400 }
      );
    }

    const claimedIds: string[] = [];
    const adminDb = getAdminDb();
    const normEmail = (customerEmail || "").toLowerCase().trim();

    // Helper to update a booking doc
    const linkBooking = async (bId: string, currentData: any) => {
      if (claimedIds.includes(bId)) return;
      try {
        if (adminDb) {
          await adminDb.collection("bookings").doc(bId).set(
            {
              customerUid,
              source: "claimed",
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } else {
          await updateDoc(doc(db, "bookings", bId), {
            customerUid,
            source: "claimed",
            updatedAt: Date.now(),
          });
        }
        claimedIds.push(bId);
      } catch (err) {
        console.warn(`Could not link booking ${bId}:`, err);
      }
    };

    // Format 0: Single bookingId or bookingIds array
    const allBookingIds: string[] = [];
    if (bookingId && typeof bookingId === "string") allBookingIds.push(bookingId.trim());
    if (Array.isArray(bookingIds)) {
      bookingIds.forEach((id: string) => {
        if (id && typeof id === "string") allBookingIds.push(id.trim());
      });
    }

    for (const bId of allBookingIds) {
      try {
        if (adminDb) {
          const snap = await adminDb.collection("bookings").doc(bId).get();
          if (snap.exists) {
            const data = snap.data();
            // Allow linking if booking has no uid yet, or email matches, or user claimed it
            if (!data?.customerUid || (normEmail && data?.customer?.email?.toLowerCase() === normEmail)) {
              await linkBooking(bId, data);
            }
          }
        } else {
          const snap = await getDoc(doc(db, "bookings", bId));
          if (snap.exists()) {
            const data = snap.data();
            if (!data?.customerUid || (normEmail && data?.customer?.email?.toLowerCase() === normEmail)) {
              await linkBooking(bId, data);
            }
          }
        }
      } catch (err) {
        console.warn(`Check error on booking ${bId}:`, err);
      }
    }

    // Format 1: claims array of { bookingId, claimToken }
    if (Array.isArray(claims)) {
      for (const item of claims) {
        const { bookingId: bId, claimToken } = item;
        if (!bId) continue;

        const hash = claimToken ? crypto.createHash("sha256").update(claimToken).digest("hex") : null;

        try {
          if (adminDb) {
            const snap = await adminDb.collection("bookings").doc(bId).get();
            if (snap.exists) {
              const data = snap.data();
              if (data?.claimTokenHash === hash || !data?.customerUid || (normEmail && data?.customer?.email?.toLowerCase() === normEmail)) {
                await linkBooking(bId, data);
              }
            }
          } else {
            const snap = await getDoc(doc(db, "bookings", bId));
            if (snap.exists()) {
              const data = snap.data();
              if (data?.claimTokenHash === hash || !data?.customerUid || (normEmail && data?.customer?.email?.toLowerCase() === normEmail)) {
                await linkBooking(bId, data);
              }
            }
          }
        } catch (err) {
          console.warn("Claim format 1 error:", err);
        }
      }
    }

    // Format 2: claimTokens array of token strings
    if (Array.isArray(claimTokens) && claimTokens.length > 0) {
      for (const token of claimTokens) {
        if (!token) continue;
        const hash = crypto.createHash("sha256").update(token).digest("hex");
        try {
          if (adminDb) {
            const snap = await adminDb
              .collection("bookings")
              .where("claimTokenHash", "==", hash)
              .get();
            for (const d of snap.docs) {
              await linkBooking(d.id, d.data());
            }
          } else {
            const q = query(collection(db, "bookings"), where("claimTokenHash", "==", hash));
            const snap = await getDocs(q);
            for (const d of snap.docs) {
              await linkBooking(d.id, d.data());
            }
          }
        } catch (err) {
          console.warn("Claim format 2 error:", err);
        }
      }
    }

    // Format 3: Email matching (claims any unassigned bookings that were made with customerEmail)
    if (normEmail) {
      try {
        if (adminDb) {
          const emailSnap = await adminDb.collection("bookings").get();
          for (const d of emailSnap.docs) {
            const data = d.data();
            const bEmail = (data.customer?.email || "").toLowerCase().trim();
            if (bEmail === normEmail && !data.customerUid) {
              await linkBooking(d.id, data);
            }
          }
        } else {
          const snap = await getDocs(collection(db, "bookings"));
          for (const d of snap.docs) {
            const data = d.data();
            const bEmail = (data.customer?.email || "").toLowerCase().trim();
            if (bEmail === normEmail && !data.customerUid) {
              await linkBooking(d.id, data);
            }
          }
        }
      } catch (err) {
        console.warn("Claim format 3 email error:", err);
      }
    }

    // Update customer directory document in customers/{customerUid}
    if (claimedIds.length > 0) {
      try {
        const custData = {
          id: customerUid,
          isRegisteredUser: true,
          source: "Portal Account",
          updatedAt: Date.now(),
        };
        if (adminDb) {
          await adminDb.collection("customers").doc(customerUid).set(custData, { merge: true });
        } else {
          await setDoc(doc(db, "customers", customerUid), custData, { merge: true });
        }
      } catch {}
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
