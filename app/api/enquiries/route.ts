import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validators";
import { siteConfig } from "@/lib/site-config";

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

  // Log lead to server output so no lead is ever lost
  console.log(`[ENQUIRY RECEIVED] ${enquiryType.toUpperCase()} from ${name} (${email}) - Service: ${service || 'None'}`);

  // If RESEND_API_KEY is configured in environment, dispatch email directly to Benedict
  if (process.env.RESEND_API_KEY) {
    try {
      const isBooking = enquiryType === "booking";
      const subject = `New ${isBooking ? "Booking Request" : "Enquiry"}: ${name}`;
      const textContent = `New enquiry from SH Photography website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Type: ${isBooking ? 'Booking Request' : 'General Message'}
Service: ${service || 'Not specified'}
Preferred Date: ${preferredDate || 'Not specified'}
Location: ${location || 'Not specified'}

Message:
${message}
`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SH Photography Website <onboarding@resend.dev>",
          to: siteConfig.email,
          reply_to: email,
          subject,
          text: textContent,
        }),
      });
    } catch (err) {
      console.error("Resend delivery notice:", err);
    }
  }

  return NextResponse.json({ ok: true, recipient: siteConfig.email });
}
