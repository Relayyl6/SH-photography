import { siteConfig } from "./site-config";

export type EnquiryFormValues = {
  name: string;
  email: string;
  phone?: string;
  enquiryType: "message" | "booking";
  service?: string;
  preferredDate?: string;
  location?: string;
  message: string;
};

// Builds a wa.me deep link with a URL-encoded, readable pre-filled message
// (client_spec.md A8.2, Phase 4). Pure function — easy to unit test.
export function buildWhatsappUrl(values: EnquiryFormValues, serviceLabel?: string): string {
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
  if (values.location) lines.push(`• *Location:* ${values.location}`);
  lines.push(``, `*Message:*`, values.message);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${siteConfig.whatsappE164}?text=${text}`;
}

export function buildEnquiryMailtoUrl(values: EnquiryFormValues, serviceLabel?: string): string {
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
  if (values.location) bodyLines.push(`• Location: ${values.location}`);

  bodyLines.push(
    ``,
    `MESSAGE:`,
    values.message,
    ``,
    `---`,
    `Sent from SH Photography contact form`
  );

  return buildMailtoUrl(subject, bodyLines.join("\n"));
}

export function buildGmailComposeUrl(values: EnquiryFormValues, serviceLabel?: string): string {
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
  if (values.location) bodyLines.push(`• Location: ${values.location}`);

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
    to: siteConfig.email,
    su: subject,
    body: bodyLines.join("\n"),
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildMailtoUrl(subject: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${siteConfig.email}${qs ? `?${qs}` : ""}`;
}

export function buildTelUrl(): string {
  return `tel:${siteConfig.phoneE164}`;
}
