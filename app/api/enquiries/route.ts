import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validators";

// Stub for submitEnquiry (client_spec.md Phase 4 / DATA-MODEL.md `enquiries`).
// Not yet wired to Postgres or Resend — that lands with Phase 0/4 (Supabase
// or Neon + Drizzle, then Resend). The contract below is already correct:
//
//   1. validate (done here)
//   2. insert into `enquiries` BEFORE sending email, so a failed send never
//      loses a lead (AGENTS.md §5 rule 5)
//   3. send via Resend to ENQUIRY_TO_EMAIL, reply-to = visitor's email
//   4. return { ok: true }
//
// Swap the TODO block below for the real DB + Resend calls; the form and
// its validation do not need to change.
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

  // TODO (Phase 0/4): insert parsed.data into `enquiries` (channel: "email"),
  // then send via Resend. Save before you send (AGENTS.md §5 rule 5).

  return NextResponse.json({ ok: true });
}
