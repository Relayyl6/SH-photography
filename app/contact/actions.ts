"use server";

import { enquirySchema, type EnquiryInput } from "@/lib/validators";

export type SubmitEnquiryResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof EnquiryInput, string>> };

// Phase 4 server action. DB (Supabase/Neon + Drizzle) and Resend are not
// wired up yet in this build — AGENTS.md §5 rule 5 ("save before you send")
// still governs the eventual implementation:
//
//   1. insert into `enquiries` (status: 'new', channel: 'email')
//   2. send notification via Resend to ENQUIRY_TO_EMAIL, reply-to the visitor
//   3. only then return ok
//
// Until DATABASE_URL / RESEND_API_KEY are configured (.env.example), this
// validates server-side and returns a clear "not yet connected" error rather
// than silently pretending to deliver the enquiry.
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

  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  if (!hasDatabase || !hasResend) {
    return {
      ok: false,
      error:
        "The email enquiry system isn't connected yet (DATABASE_URL / RESEND_API_KEY missing). Please use the WhatsApp button below, or email directly, in the meantime.",
    };
  }

  // TODO (Phase 0 / Phase 4): insert into `enquiries`, then send via Resend.
  return { ok: true };
}
