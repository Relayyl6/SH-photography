import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection, id, data } = body;

    if (!collection || !id || !data) {
      return NextResponse.json(
        { error: "Missing required fields: collection, id, or data." },
        { status: 400 }
      );
    }

    const payload = {
      ...data,
      published: true,
      updatedAt: Date.now(),
    };

    // Try adminDb first (bypasses security rules restriction)
    let saved = false;
    const adminDb = getAdminDb();
    if (adminDb) {
      try {
        await adminDb.collection(collection).doc(id).set(payload, { merge: true });
        saved = true;
      } catch (adminErr) {
        console.warn("adminDb write failed, attempting client SDK:", adminErr);
      }
    }

    if (!saved) {
      await setDoc(doc(db, collection, id), payload, { merge: true });
    }

    return NextResponse.json({
      success: true,
      collection,
      id,
      updatedAt: payload.updatedAt,
    });
  } catch (err: any) {
    console.error("Admin content save API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save document." },
      { status: 500 }
    );
  }
}
