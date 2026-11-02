import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

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

    // 1. Query by customerUid if uid provided
    if (uid) {
      try {
        const snap = await adminDb
          .collection("bookings")
          .where("customerUid", "==", uid)
          .get();

        snap.forEach((doc) => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            bookings.push({ id: doc.id, ...doc.data() });
          }
        });
      } catch (err) {
        console.warn("Error querying bookings by uid:", err);
      }
    }

    // 2. Query by customer.email if email provided
    if (email) {
      try {
        const snap = await adminDb
          .collection("bookings")
          .where("customer.email", "==", email.toLowerCase().trim())
          .get();

        snap.forEach((doc) => {
          if (!seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            bookings.push({ id: doc.id, ...doc.data() });
          }
        });
      } catch (err) {
        console.warn("Error querying bookings by email:", err);
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
