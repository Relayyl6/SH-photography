import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validators";
import { db } from "@/lib/firebase/config";
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

  const { name, email, phone, enquiryType, service, preferredDate, location, message } = parsed.data;

  const enquiryId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const enquiryRecord = {
    id: enquiryId,
    name,
    email,
    phone: phone || null,
    enquiryType,
    service: service || null,
    preferredDate: preferredDate || null,
    location: location || null,
    message,
    status: "new",
    createdAt: Date.now(),
  };

  // 1. Save to Firestore enquiries collection
  try {
    await setDoc(doc(db, "enquiries", enquiryId), enquiryRecord);
  } catch (err) {
    console.error("Failed to write enquiry to Firestore:", err);
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
      location: location || undefined,
      message,
    });
  } catch (emailErr) {
    console.error("Failed to dispatch enquiry email:", emailErr);
  }

  return NextResponse.json({ ok: true, enquiryId });
}
