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
export function buildWhatsappUrl(values: EnquiryFormValues): string {
  const lines = [
    `New ${values.enquiryType === "booking" ? "booking request" : "message"} from the website`,
    `Name: ${values.name}`,
    `Email: ${values.email}`,
  ];
  if (values.phone) lines.push(`Phone: ${values.phone}`);
  if (values.service) lines.push(`Service: ${values.service}`);
  if (values.preferredDate) lines.push(`Preferred date: ${values.preferredDate}`);
  if (values.location) lines.push(`Location: ${values.location}`);
  lines.push("", values.message);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${siteConfig.whatsappE164}?text=${text}`;
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
