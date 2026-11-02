"use server";

import { enquirySchema, type EnquiryInput } from "@/lib/validators";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { sendEnquiryNotification } from "@/lib/email";

export type SubmitEnquiryResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof EnquiryInput, string>> };

export async function submitEnquiry(raw: EnquiryInput): Promise<SubmitEnquiryResult> {
  const parsed = enquirySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof EnquiryInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof EnquiryInput;
      if (key) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please check the form and try again.", fieldErrors };
  }

  // Honeypot tripped — report success to the bot, do nothing.
  if (parsed.data.company) {
    return { ok: true };
  }

  const { name, email, phone, enquiryType, service, preferredDate, location, message } = parsed.data;
  const enquiryId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    // 1. Save to Firestore enquiries
    await setDoc(doc(db, "enquiries", enquiryId), {
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
    });

    // 2. Send email via Gmail SMTP
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

    return { ok: true };
  } catch (err: any) {
    console.error("Error submitting enquiry:", err);
    return { ok: false, error: err.message || "Failed to submit enquiry. Please try again." };
  }
}
