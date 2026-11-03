import { siteConfig } from "./site-config";

export type EnquiryFormValues = {
  name: string;
  email: string;
  phone?: string;
  enquiryType: "message" | "booking";
  service?: string;
  preferredDate?: string;
  isDoubleDate?: boolean;
  secondaryDate?: string;
  location?: string;
  message: string;
  extraInfo?: string;
};

// Builds a wa.me deep link with a URL-encoded, readable pre-filled message
// (client_spec.md A8.2, Phase 4). Pure function — easy to unit test.
export function buildWhatsappUrl(
  values: EnquiryFormValues,
  serviceLabel?: string,
  overrideWhatsapp?: string
): string {
  const isBooking = values.enquiryType === "booking";
  const sLabel = serviceLabel || values.service;
  const lines = [
    `📸 *New ${isBooking ? "Booking Request" : "Message"} — SH Photography*`,
    ``,
    `• *Name:* ${values.name}`,
    `• *Email:* ${values.email}`,
  ];
  if (values.phone) lines.push(`• *Phone:* ${values.phone}`);
  lines.push(`• *Enquiry Type:* ${isBooking ? "Booking Request" : "General Message"}`);
  if (sLabel) lines.push(`• *Service:* ${sLabel}`);
  if (values.preferredDate) lines.push(`• *Preferred Date:* ${values.preferredDate}`);
  if (values.isDoubleDate) {
    lines.push(`• *Double / Multi-Day Coverage:* Yes (Secondary: ${values.secondaryDate || "TBD"})`);
  }
  if (values.location) lines.push(`• *Location:* ${values.location}`);
  if (values.extraInfo) lines.push(`• *Extra Details:* ${values.extraInfo}`);
  lines.push(``, `*Message:*`, values.message);

  const text = encodeURIComponent(lines.join("\n"));
  const number = (overrideWhatsapp || siteConfig.whatsappE164).replace(/\D/g, "");
  return `https://wa.me/${number}?text=${text}`;
}

export function buildEnquiryMailtoUrl(
  values: EnquiryFormValues,
  serviceLabel?: string,
  overrideEmail?: string
): string {
  const isBooking = values.enquiryType === "booking";
  const sLabel = serviceLabel || values.service;
  const subject = `New ${isBooking ? "Booking Request" : "Enquiry"}: ${values.name}${sLabel ? ` (${sLabel})` : ""}`;

  const bodyLines = [
    `Hi Benedict,`,
    ``,
    `You have received a new ${isBooking ? "booking request" : "enquiry"} from your SH Photography website:`,
    ``,
    `CLIENT INFORMATION`,
    `• Name: ${values.name}`,
    `• Email: ${values.email}`,
  ];
  if (values.phone) bodyLines.push(`• Phone: ${values.phone}`);
  bodyLines.push(`• Type: ${isBooking ? "Booking Request" : "General Message"}`);
  if (sLabel) bodyLines.push(`• Service / Package: ${sLabel}`);
  if (values.preferredDate) bodyLines.push(`• Preferred Date: ${values.preferredDate}`);
  if (values.isDoubleDate) {
    bodyLines.push(`• Double / Multi-Day Coverage: Yes (Secondary Date: ${values.secondaryDate || "TBD"})`);
  }
  if (values.location) bodyLines.push(`• Location: ${values.location}`);
  if (values.extraInfo) bodyLines.push(`• Extra Info & Requests: ${values.extraInfo}`);

  bodyLines.push(
    ``,
    `MESSAGE:`,
    values.message,
    ``,
    `---`,
    `Sent from SH Photography contact form`
  );

  return buildMailtoUrl(subject, bodyLines.join("\n"), overrideEmail);
}

export function buildGmailComposeUrl(
  values: EnquiryFormValues,
  serviceLabel?: string,
  overrideEmail?: string
): string {
  const isBooking = values.enquiryType === "booking";
  const sLabel = serviceLabel || values.service;
  const subject = `New ${isBooking ? "Booking Request" : "Enquiry"}: ${values.name}${sLabel ? ` (${sLabel})` : ""}`;

  const bodyLines = [
    `Hi Benedict,`,
    ``,
    `You have a new ${isBooking ? "booking request" : "enquiry"} from your SH Photography website:`,
    ``,
    `CLIENT INFORMATION`,
    `• Name: ${values.name}`,
    `• Email: ${values.email}`,
  ];
  if (values.phone) bodyLines.push(`• Phone: ${values.phone}`);
  bodyLines.push(`• Type: ${isBooking ? "Booking Request" : "General Message"}`);
  if (sLabel) bodyLines.push(`• Service / Package: ${sLabel}`);
  if (values.preferredDate) bodyLines.push(`• Preferred Date: ${values.preferredDate}`);
  if (values.isDoubleDate) {
    bodyLines.push(`• Double / Multi-Day Coverage: Yes (Secondary Date: ${values.secondaryDate || "TBD"})`);
  }
  if (values.location) bodyLines.push(`• Location: ${values.location}`);
  if (values.extraInfo) bodyLines.push(`• Extra Info & Requests: ${values.extraInfo}`);

  bodyLines.push(
    ``,
    `MESSAGE:`,
    values.message,
    ``,
    `---`,
    `Sent from SH Photography contact form`
  );

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: overrideEmail || siteConfig.email,
    su: subject,
    body: bodyLines.join("\n"),
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildOutlookComposeUrl(
  values: EnquiryFormValues,
  serviceLabel?: string,
  overrideEmail?: string
): string {
  const isBooking = values.enquiryType === "booking";
  const sLabel = serviceLabel || values.service;
  const subject = `New ${isBooking ? "Booking Request" : "Enquiry"}: ${values.name}${sLabel ? ` (${sLabel})` : ""}`;

  const bodyLines = [
    `Hi Benedict,`,
    ``,
    `You have a new ${isBooking ? "booking request" : "enquiry"} from your SH Photography website:`,
    ``,
    `CLIENT INFORMATION`,
    `• Name: ${values.name}`,
    `• Email: ${values.email}`,
  ];
  if (values.phone) bodyLines.push(`• Phone: ${values.phone}`);
  bodyLines.push(`• Type: ${isBooking ? "Booking Request" : "General Message"}`);
  if (sLabel) bodyLines.push(`• Service / Package: ${sLabel}`);
  if (values.preferredDate) bodyLines.push(`• Preferred Date: ${values.preferredDate}`);
  if (values.isDoubleDate) {
    bodyLines.push(`• Double / Multi-Day Coverage: Yes (Secondary Date: ${values.secondaryDate || "TBD"})`);
  }
  if (values.location) bodyLines.push(`• Location: ${values.location}`);
  if (values.extraInfo) bodyLines.push(`• Extra Info & Requests: ${values.extraInfo}`);

  bodyLines.push(
    ``,
    `MESSAGE:`,
    values.message,
    ``,
    `---`,
    `Sent from SH Photography contact form`
  );

  const params = new URLSearchParams({
    to: overrideEmail || siteConfig.email,
    subject: subject,
    body: bodyLines.join("\n"),
  });

  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

export function buildMailtoUrl(subject: string, body?: string, overrideEmail?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${overrideEmail || siteConfig.email}${qs ? `?${qs}` : ""}`;
}

export function buildTelUrl(overridePhone?: string): string {
  return `tel:${(overridePhone || siteConfig.phoneE164).replace(/\s+/g, "")}`;
}
