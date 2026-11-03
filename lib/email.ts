import nodemailer from "nodemailer";

interface BookingEmailPayload {
  bookingId: string;
  sessionId: string;
  sessionName: string;
  date: string;
  timeSlot: { start: string; end: string };
  customer: { name: string; email: string; phone?: string };
  answers?: Record<string, any>;
  isDoubleDate?: boolean;
  secondaryDate?: string;
  extraInfo?: string;
}

interface EnquiryEmailPayload {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  service?: string;
  preferredDate?: string;
  isDoubleDate?: boolean;
  secondaryDate?: string;
  location?: string;
  message: string;
  extraInfo?: string;
}

interface RescheduleRequestPayload {
  bookingId: string;
  sessionName: string;
  currentSlot: { date: string; start: string; end: string };
  requestedSlot: { date: string; start: string; end: string };
  requestedLocation?: string;
  requestedPhone?: string;
  requestedNotes?: string;
  customer: { name: string; email: string; phone?: string };
}

interface RescheduleDecisionPayload {
  bookingId: string;
  sessionName: string;
  status: "approved" | "declined";
  slot: { date: string; start: string; end: string };
  customer: { name: string; email: string };
  ownerMessage?: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 5000,
  });
}

export async function sendBookingNotifications(payload: BookingEmailPayload) {
  const transporter = getTransporter();
  const ownerEmails = (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const from = process.env.EMAIL_FROM || `SH Photography <${process.env.SMTP_USER}>`;

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
          ${
            payload.isDoubleDate || payload.answers?.isDoubleDate
              ? `<tr>
                  <td style="padding: 6px 0; color: #78716c;"><strong>Multiple Dates:</strong></td>
                  <td style="padding: 6px 0; color: #ea580c; font-weight: 600;">Double / Multi-Day Coverage requested (Secondary Date: ${payload.secondaryDate || payload.answers?.secondaryDate || "TBD"})</td>
                </tr>`
              : ""
          }
          ${
            payload.extraInfo || payload.answers?.extraInfo
              ? `<tr>
                  <td style="padding: 6px 0; color: #78716c;"><strong>Custom Notes:</strong></td>
                  <td style="padding: 6px 0; color: #1c1917;">${payload.extraInfo || payload.answers?.extraInfo}</td>
                </tr>`
              : ""
          }
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

  if (ownerEmails.length > 0) {
    await transporter.sendMail({
      from,
      to: ownerEmails,
      replyTo: payload.customer.email,
      subject: `📸 New Booking: ${payload.sessionName} – ${payload.customer.name} (${payload.date})`,
      html: ownerHtml,
    });
  }

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
        Benedict will review your details, location, and creative notes, then contact you to finalize arrangements. You can also view and request changes to your booking anytime in your client account portal.
      </p>

      <div style="text-align: center; font-size: 12px; color: #a8a29e; margin-top: 24px; border-top: 1px solid #e7e5e4; padding-top: 16px;">
        SH Photography • Manchester, United Kingdom • <a href="https://wa.me/447404192667" style="color: #ea580c;">WhatsApp Us</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: payload.customer.email,
    replyTo: ownerEmails[0] || process.env.SMTP_USER,
    subject: `Your SH Photography Session Request: ${payload.sessionName}`,
    html: customerHtml,
  });
}

export async function sendEnquiryNotification(payload: EnquiryEmailPayload) {
  const transporter = getTransporter();
  const ownerEmails = (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const from = process.env.EMAIL_FROM || `SH Photography <${process.env.SMTP_USER}>`;

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
        ${
          payload.isDoubleDate
            ? `<tr>
                <td style="padding: 6px 0; color: #78716c;"><strong>Double / Multi-Day:</strong></td>
                <td style="padding: 6px 0; color: #ea580c; font-weight: 600;">Yes (Secondary Date: ${payload.secondaryDate || "TBD"})</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #78716c;"><strong>Location:</strong></td>
          <td style="padding: 6px 0; color: #1c1917;">${payload.location || "Manchester / TBD"}</td>
        </tr>
        ${
          payload.extraInfo
            ? `<tr>
                <td style="padding: 6px 0; color: #78716c;"><strong>Additional Info:</strong></td>
                <td style="padding: 6px 0; color: #1c1917;">${payload.extraInfo}</td>
              </tr>`
            : ""
        }
      </table>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e7e5e4;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1c1917; white-space: pre-wrap;">${payload.message}</p>
      </div>

      <div style="text-align: center; font-size: 12px; color: #a8a29e; margin-top: 24px;">
        SH Photography Studio • Manchester, United Kingdom
      </div>
    </div>
  `;

  if (ownerEmails.length > 0) {
    await transporter.sendMail({
      from,
      to: ownerEmails,
      replyTo: payload.email,
      subject,
      html,
    });
  }
}

// 3. Reschedule / Change Request Notification to Owner
export async function sendRescheduleRequestNotification(payload: RescheduleRequestPayload) {
  const transporter = getTransporter();
  const ownerEmails = (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const from = process.env.EMAIL_FROM || `SH Photography <${process.env.SMTP_USER}>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fdfbf7; border-radius: 16px; border: 1px solid #e7e5e4;">
      <div style="border-bottom: 2px solid #e11d48; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #e11d48; font-weight: 700;">Action Required • Reschedule Request</span>
        <h1 style="font-size: 22px; margin: 4px 0 0 0; color: #0c0a09;">${payload.customer.name} requested changes</h1>
        <p style="font-size: 12px; color: #78716c; margin: 2px 0 0 0;">Booking #${payload.bookingId.substring(0, 8)} • ${payload.sessionName}</p>
      </div>

      <div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #e7e5e4; margin-bottom: 16px;">
        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #a8a29e; margin: 0 0 8px 0;">Current Confirmed Slot</h3>
        <p style="margin: 0; font-size: 14px; color: #78716c; text-decoration: line-through;">
          📅 ${payload.currentSlot.date} &nbsp;⏰ ${payload.currentSlot.start} – ${payload.currentSlot.end}
        </p>
      </div>

      <div style="background-color: #fff1f2; padding: 18px; border-radius: 12px; border: 1px solid #fecdd3; margin-bottom: 20px;">
        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #e11d48; margin: 0 0 8px 0;">New Requested Slot</h3>
        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #9f1239;">
          📅 ${payload.requestedSlot.date} &nbsp;⏰ ${payload.requestedSlot.start} – ${payload.requestedSlot.end}
        </p>
        ${payload.requestedLocation ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #881337;">📍 Location: ${payload.requestedLocation}</p>` : ""}
        ${payload.requestedPhone ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #881337;">📞 Phone: ${payload.requestedPhone}</p>` : ""}
        ${payload.requestedNotes ? `<p style="margin: 8px 0 0 0; font-size: 13px; font-style: italic; color: #4c0519;">“${payload.requestedNotes}”</p>` : ""}
      </div>

      <p style="font-size: 13px; color: #57534e; line-height: 1.5;">
        This rescheduling is currently marked as <strong>Pending Approval</strong>. To approve or decline this change, open your studio admin dashboard:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://sh-photography.vercel.app"}/admin/bookings" style="display: inline-block; background-color: #0c0a09; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px;">
          Review in Owner Dashboard &rarr;
        </a>
      </div>

      <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 14px;">
        SH Photography Studio • Manchester, United Kingdom
      </div>
    </div>
  `;

  if (ownerEmails.length > 0) {
    await transporter.sendMail({
      from,
      to: ownerEmails,
      replyTo: payload.customer.email,
      subject: `⚠️ Reschedule Request: ${payload.sessionName} – ${payload.customer.name} (Requested: ${payload.requestedSlot.date})`,
      html,
    });
  }
}

// 4. Decision Notification to Customer (Approved / Declined)
export async function sendRescheduleDecisionNotification(payload: RescheduleDecisionPayload) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || `SH Photography <${process.env.SMTP_USER}>`;
  const isApproved = payload.status === "approved";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fdfbf7; border-radius: 16px; border: 1px solid #e7e5e4;">
      <div style="border-bottom: 2px solid ${isApproved ? "#16a34a" : "#dc2626"}; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: ${isApproved ? "#16a34a" : "#dc2626"}; font-weight: 700;">
          ${isApproved ? "Reschedule Confirmed" : "Reschedule Update"}
        </span>
        <h1 style="font-size: 22px; margin: 4px 0 0 0; color: #0c0a09;">
          ${isApproved ? "Your new session time is approved!" : "Update regarding your reschedule request"}
        </h1>
        <p style="font-size: 12px; color: #78716c; margin: 2px 0 0 0;">Booking #${payload.bookingId.substring(0, 8)} • ${payload.sessionName}</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
        Hi ${payload.customer.name},<br/><br/>
        ${
          isApproved
            ? `Benedict has confirmed your requested date and time changes. Your session for <strong>${payload.sessionName}</strong> is now locked in for:`
            : `Benedict reviewed your reschedule request for <strong>${payload.sessionName}</strong>, but unfortunately the requested slot is not available.`
        }
      </p>

      <div style="background-color: ${isApproved ? "#f0fdf4" : "#fef2f2"}; padding: 18px; border-radius: 12px; border: 1px solid ${isApproved ? "#bbf7d0" : "#fecaca"}; margin: 18px 0;">
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: ${isApproved ? "#166534" : "#991b1b"};">
          Confirmed Shoot Time: ${payload.slot.date} (${payload.slot.start} – ${payload.slot.end})
        </p>
        ${payload.ownerMessage ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #44403c;">Note from Benedict: “${payload.ownerMessage}”</p>` : ""}
      </div>

      <p style="font-size: 13px; color: #78716c; line-height: 1.5;">
        You can always view your latest session schedule or download an updated calendar file directly in your client portal.
      </p>

      <div style="text-align: center; font-size: 12px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 14px; margin-top: 24px;">
        SH Photography • Manchester, United Kingdom • <a href="https://wa.me/447404192667" style="color: #ea580c;">Chat on WhatsApp</a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: payload.customer.email,
    replyTo: (process.env.OWNER_EMAILS || "").split(",")[0] || process.env.SMTP_USER,
    subject: `${isApproved ? "✅ Confirmed: New Shoot Date" : "ℹ️ Update"} on ${payload.sessionName} (Booking #${payload.bookingId.substring(0, 8)})`,
    html,
  });
}
