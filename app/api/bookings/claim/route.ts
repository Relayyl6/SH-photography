import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
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
        } catch (adminErr) {
          // Fallback to client SDK
          try {
            const snap = await getDoc(doc(db, "bookings", bookingId));
            if (snap.exists()) {
              const data = snap.data();
              if (data?.claimTokenHash === hash || !data?.customerUid) {
                await updateDoc(doc(db, "bookings", bookingId), {
                  customerUid,
                  source: "claimed",
                  updatedAt: Date.now(),
                });
                claimedIds.push(bookingId);
              }
            }
          } catch (clientErr) {
            console.warn("Client fallback claim error:", clientErr);
          }
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

          for (const d of snap.docs) {
            await d.ref.update({
              customerUid,
              source: "claimed",
              updatedAt: Date.now(),
            });
            claimedIds.push(d.id);
          }
        } catch (adminErr) {
          try {
            const q = query(collection(db, "bookings"), where("claimTokenHash", "==", hash));
            const snap = await getDocs(q);
            for (const d of snap.docs) {
              await updateDoc(doc(db, "bookings", d.id), {
                customerUid,
                source: "claimed",
                updatedAt: Date.now(),
              });
              claimedIds.push(d.id);
            }
          } catch (clientErr) {
            console.warn("Client fallback token claim error:", clientErr);
          }
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

        for (const d of emailSnap.docs) {
          const data = d.data();
          if (!data.customerUid) {
            await d.ref.update({
              customerUid,
              updatedAt: Date.now(),
            });
            if (!claimedIds.includes(d.id)) {
              claimedIds.push(d.id);
            }
          }
        }
      } catch (adminErr) {
        try {
          const q = query(
            collection(db, "bookings"),
            where("customer.email", "==", customerEmail.toLowerCase().trim())
          );
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            const data = d.data();
            if (!data.customerUid) {
              await updateDoc(doc(db, "bookings", d.id), {
                customerUid,
                updatedAt: Date.now(),
              });
              if (!claimedIds.includes(d.id)) {
                claimedIds.push(d.id);
              }
            }
          }
        } catch (clientErr) {
          console.warn("Client fallback email claim error:", clientErr);
        }
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
