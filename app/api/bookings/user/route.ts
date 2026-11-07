import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const email = searchParams.get("email");

    if (!uid && !email) {
      return NextResponse.json(
        { error: "Must provide uid or email parameter." },
        { status: 400 }
      );
    }

    const bookings: any[] = [];
    const seenIds = new Set<string>();
    const adminDb = getAdminDb();
    const emailsToMatch = new Set<string>();

    if (email) {
      emailsToMatch.add(email.toLowerCase().trim());
    }

    // 0. Check if user document in customers has any linkedEmails
    if (uid) {
      try {
        if (adminDb) {
          const custSnap = await adminDb.collection("customers").doc(uid).get();
          if (custSnap.exists) {
            const cData = custSnap.data();
            if (cData?.email) emailsToMatch.add(cData.email.toLowerCase().trim());
            if (Array.isArray(cData?.linkedEmails)) {
              cData.linkedEmails.forEach((em: string) => {
                if (em) emailsToMatch.add(em.toLowerCase().trim());
              });
            }
          }
        } else {
          const custSnap = await getDoc(doc(db, "customers", uid));
          if (custSnap.exists()) {
            const cData = custSnap.data();
            if (cData?.email) emailsToMatch.add(cData.email.toLowerCase().trim());
            if (Array.isArray(cData?.linkedEmails)) {
              cData.linkedEmails.forEach((em: string) => {
                if (em) emailsToMatch.add(em.toLowerCase().trim());
              });
            }
          }
        }
      } catch (custErr) {
        console.warn("Could not load linkedEmails for customer:", custErr);
      }
    }

    // 1. Try querying via adminDb (Firebase Admin SDK)
    let adminDbWorked = false;
    try {
      if (adminDb) {
        if (uid) {
          const snap = await adminDb
            .collection("bookings")
            .where("customerUid", "==", uid)
            .get();

          snap.forEach((d: any) => {
            if (!seenIds.has(d.id)) {
              seenIds.add(d.id);
              bookings.push({ id: d.id, ...d.data() });
            }
          });
        }

        // Also query all bookings to do case-insensitive email match across customer.email, customerEmail, and answers.email
        if (emailsToMatch.size > 0) {
          const allSnap = await adminDb.collection("bookings").get();
          allSnap.forEach((d: any) => {
            if (seenIds.has(d.id)) return;
            const data = d.data();
            const bEmail = (data.customer?.email || data.customerEmail || data.answers?.email || "").toLowerCase().trim();
            if (bEmail && emailsToMatch.has(bEmail)) {
              seenIds.add(d.id);
              bookings.push({ id: d.id, ...data });
            }
          });
        }

        adminDbWorked = true;
      }
    } catch (adminErr) {
      console.warn("adminDb query error (falling back to client db):", adminErr);
    }

    // 2. Fallback to client db if adminDb was not configured or had an issue
    if (!adminDbWorked || bookings.length === 0) {
      try {
        if (uid) {
          const q = query(collection(db, "bookings"), where("customerUid", "==", uid));
          const snap = await getDocs(q);
          snap.forEach((d) => {
            if (!seenIds.has(d.id)) {
              seenIds.add(d.id);
              bookings.push({ id: d.id, ...d.data() });
            }
          });
        }

        // Fallback scan for matching emails
        if (emailsToMatch.size > 0) {
          const snap = await getDocs(collection(db, "bookings"));
          snap.forEach((d) => {
            if (seenIds.has(d.id)) return;
            const data = d.data();
            const bEmail = (data.customer?.email || data.customerEmail || data.answers?.email || "").toLowerCase().trim();
            if (bEmail && emailsToMatch.has(bEmail)) {
              seenIds.add(d.id);
              bookings.push({ id: d.id, ...data });
            }
          });
        }
      } catch (clientErr) {
        console.warn("Client db fallback query error:", clientErr);
      }
    }

    // Sort newest first
    bookings.sort((a, b) => {
      const timeA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt || 0).getTime();
      const timeB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, bookings });
  } catch (err: any) {
    console.error("Error fetching user bookings:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}
