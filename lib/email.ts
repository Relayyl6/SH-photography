import nodemailer from "nodemailer";

interface BookingEmailPayload {
  bookingId: string;
  sessionId: string;
  sessionName: string;
  date: string;
  timeSlot: { start: string; end: string };
  customer: { name: string; email: string; phone?: string };
  answers?: Record<string, string>;
}

interface EnquiryEmailPayload {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  service?: string;
  preferredDate?: string;
  location?: string;
  message: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "yemuelinc@gmail.com";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendBookingNotifications(payload: BookingEmailPayload) {
  const transporter = getTransporter();
  const ownerEmails = (process.env.OWNER_EMAILS || "shfotography1@gmail.com,oseghaleleonard39@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const from = process.env.EMAIL_FROM || "SH Photography <yemuelinc@gmail.com>";

  // 1. Send detailed notification to Owners
  const ownerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fdfbf7; border-radius: 16px; border: 1px solid #e7e5e4;">
      <div style="border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #ea580c; font-weight: 700;">New Reservation</span>
        <h1 style="font-size: 24px; margin: 4px 0 0 0; color: #0c0a09; font-serif;">Booking #${payload.bookingId.substring(0, 8)}</h1>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e7e5e4; margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #ea580c;">${payload.sessionName}</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #78716c; width: 120px;"><strong>Date:</strong></td>
            <td style="padding: 6px 0; color: #1c1917;">${payload.date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;"><strong>Time:</strong></td>
            <td style="padding: 6px 0; color: #1c1917;">${payload.timeSlot.start} – ${payload.timeSlot.end}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;"><strong>Client:</strong></td>
            <td style="padding: 6px 0; color: #1c1917;">${payload.customer.name} (<a href="mailto:${payload.customer.email}" style="color: #ea580c;">${payload.customer.email}</a>)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;"><strong>Phone:</strong></td>
            <td style="padding: 6px 0; color: #1c1917;">${payload.customer.phone || "Not provided"}</td>
          </tr>
        </table>
      </div>

      ${
        payload.answers && Object.keys(payload.answers).length > 0
          ? `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e7e5e4; margin-bottom: 20px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #78716c; margin: 0 0 10px 0;">Client Notes & Vision</h3>
          ${Object.entries(payload.answers)
            .map(
              ([k, v]) => `
            <div style="margin-bottom: 8px; font-size: 13px;">
              <strong style="color: #44403c;">${k}:</strong> <span style="color: #1c1917;">${v}</span>
            </div>`
            )
            .join("")}
        </div>`
          : ""
      }

      <div style="text-align: center; font-size: 12px; color: #a8a29e; margin-top: 24px;">
        SH Photography Studio • Manchester, United Kingdom • Automated System
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: ownerEmails,
    replyTo: payload.customer.email,
    subject: `📸 New Booking: ${payload.sessionName} – ${payload.customer.name} (${payload.date})`,
    html: ownerHtml,
  });

  // 2. Send confirmation to Customer
  const customerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fdfbf7; border-radius: 16px; border: 1px solid #e7e5e4;">
      <div style="border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #ea580c; font-weight: 700;">SH Photography</span>
        <h1 style="font-size: 24px; margin: 4px 0 0 0; color: #0c0a09;">We received your booking request!</h1>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
        Hi ${payload.customer.name},<br/><br/>
        Thank you for reserving a session with Benedict Henry at SH Photography. We have logged your request for <strong>${payload.sessionName}</strong> on <strong>${payload.date}</strong> (${payload.timeSlot.start} – ${payload.timeSlot.end}).
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
        Benedict will review your details, location, and creative notes, then contact you to finalize arrangements. You can also view and edit your booking anytime in your client account portal.
      </p>

      <div style="text-align: center; font-size: 12px; color: #a8a29e; margin-top: 24px; border-top: 1px solid #e7e5e4; padding-top: 16px;">
        SH Photography • Manchester, United Kingdom • <a href="https://wa.me/447404192667" style="color: #ea580c;">WhatsApp Us</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: payload.customer.email,
    replyTo: ownerEmails[0] || "shfotography1@gmail.com",
    subject: `Your SH Photography Session Request: ${payload.sessionName}`,
    html: customerHtml,
  });
}

export async function sendEnquiryNotification(payload: EnquiryEmailPayload) {
  const transporter = getTransporter();
  const ownerEmails = (process.env.OWNER_EMAILS || "shfotography1@gmail.com,oseghaleleonard39@gmail.com")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const from = process.env.EMAIL_FROM || "SH Photography <yemuelinc@gmail.com>";

  const isBooking = payload.enquiryType === "booking";
  const subject = `📩 New ${isBooking ? "Booking Enquiry" : "General Message"}: ${payload.name}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fdfbf7; border-radius: 16px; border: 1px solid #e7e5e4;">
      <div style="border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #ea580c; font-weight: 700;">Contact Form Submission</span>
        <h1 style="font-size: 22px; margin: 4px 0 0 0; color: #0c0a09;">${payload.name}</h1>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; color: #78716c; width: 120px;"><strong>Email:</strong></td>
          <td style="padding: 6px 0;"><a href="mailto:${payload.email}" style="color: #ea580c;">${payload.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c;"><strong>Phone:</strong></td>
          <td style="padding: 6px 0; color: #1c1917;">${payload.phone || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c;"><strong>Type:</strong></td>
          <td style="padding: 6px 0; color: #1c1917;">${payload.enquiryType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c;"><strong>Service:</strong></td>
          <td style="padding: 6px 0; color: #1c1917;">${payload.service || "Not specified"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c;"><strong>Preferred Date:</strong></td>
          <td style="padding: 6px 0; color: #1c1917;">${payload.preferredDate || "Flexible"}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c;"><strong>Location:</strong></td>
          <td style="padding: 6px 0; color: #1c1917;">${payload.location || "Manchester / TBD"}</td>
        </tr>
      </table>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e7e5e4;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1c1917; white-space: pre-wrap;">${payload.message}</p>
      </div>

      <div style="text-align: center; font-size: 12px; color: #a8a29e; margin-top: 24px;">
        SH Photography Studio • Manchester, United Kingdom
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: ownerEmails,
    replyTo: payload.email,
    subject,
    html,
  });
}
