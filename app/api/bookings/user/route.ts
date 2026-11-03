import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

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

    // 1. Try querying via adminDb (Firebase Admin SDK)
    let adminDbWorked = false;
    try {
      if (uid) {
        const snap = await adminDb
          .collection("bookings")
          .where("customerUid", "==", uid)
          .get();

        snap.forEach((doc: any) => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            bookings.push({ id: doc.id, ...doc.data() });
          }
        });
        adminDbWorked = true;
      }

      if (email) {
        const snap = await adminDb
          .collection("bookings")
          .where("customer.email", "==", email.toLowerCase().trim())
          .get();

        snap.forEach((doc: any) => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            bookings.push({ id: doc.id, ...doc.data() });
          }
        });
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

        if (email) {
          const q = query(
            collection(db, "bookings"),
            where("customer.email", "==", email.toLowerCase().trim())
          );
          const snap = await getDocs(q);
          snap.forEach((d) => {
            if (!seenIds.has(d.id)) {
              seenIds.add(d.id);
              bookings.push({ id: d.id, ...d.data() });
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
