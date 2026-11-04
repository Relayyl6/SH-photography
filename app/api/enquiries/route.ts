import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validators";
import { db } from "@/lib/firebase/config";
import { getAdminDb } from "@/lib/firebase/admin";
import { doc, setDoc } from "firebase/firestore";
import { sendEnquiryNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.company) {
    // Honeypot tripped — pretend success, do nothing.
    return NextResponse.json({ ok: true });
  }

  const {
    name,
    email,
    phone,
    enquiryType,
    service,
    preferredDate,
    isDoubleDate,
    secondaryDate,
    location,
    message,
    extraInfo,
  } = parsed.data;

  const enquiryId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const enquiryRecord = {
    id: enquiryId,
    name,
    email,
    phone: phone || null,
    enquiryType,
    service: service || null,
    preferredDate: preferredDate || null,
    isDoubleDate: Boolean(isDoubleDate),
    secondaryDate: secondaryDate || null,
    location: location || null,
    message,
    extraInfo: extraInfo || null,
    status: "new",
    createdAt: Date.now(),
  };

  // 1. Save to Firestore enquiries collection
  try {
    await setDoc(doc(db, "enquiries", enquiryId), enquiryRecord);
  } catch (err) {
    console.error("Failed to write enquiry to Firestore:", err);
  }

  // 1b. Auto-upsert customer directory record
  try {
    const normEmail = (email || "").toLowerCase().trim();
    if (normEmail) {
      const custId = `cust_${normEmail.replace(/[^a-z0-9]/gi, "_")}`;
      const adminDb = getAdminDb();
      if (adminDb) {
        const custRef = adminDb.collection("customers").doc(custId);
        const custSnap = await custRef.get();
        if (custSnap.exists) {
          const existing = custSnap.data() || {};
          await custRef.set(
            {
              name: name || existing.name || "Client",
              displayName: name || existing.displayName || "Client",
              email: normEmail,
              phone: phone || existing.phone || "",
              updatedAt: Date.now(),
              deleted: false,
            },
            { merge: true }
          );
        } else {
          await custRef.set({
            id: custId,
            name,
            displayName: name,
            email: normEmail,
            phone: phone || "",
            shootsCount: 0,
            source: "Website Inquiry",
            isRegisteredUser: false,
            notes: `Inquiry (${enquiryType || "General"}): ${message.slice(0, 150)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deleted: false,
          });
        }
      } else {
        await setDoc(
          doc(db, "customers", custId),
          {
            id: custId,
            name,
            displayName: name,
            email: normEmail,
            phone: phone || "",
            source: "Website Inquiry",
            isRegisteredUser: false,
            updatedAt: Date.now(),
            deleted: false,
          },
          { merge: true }
        );
      }
    }
  } catch (custErr) {
    console.warn("Failed to auto-upsert customer from enquiry:", custErr);
  }

  // 2. Dispatch real notification email via Gmail SMTP
  try {
    await sendEnquiryNotification({
      name,
      email,
      phone: phone || undefined,
      enquiryType,
      service: service || undefined,
      preferredDate: preferredDate || undefined,
      isDoubleDate: Boolean(isDoubleDate),
      secondaryDate: secondaryDate || undefined,
      location: location || undefined,
      message,
      extraInfo: extraInfo || undefined,
    });
  } catch (emailErr) {
    console.error("Failed to dispatch enquiry email:", emailErr);
  }

  return NextResponse.json({ ok: true, enquiryId });
}
