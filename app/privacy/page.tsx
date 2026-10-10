import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy Policy" };

// [SUGGESTED] stub (client_spec.md A4 #9). Needs a solicitor- or
// client-approved pass before launch — UK GDPR requires specifics (lawful
// basis, retention period, data processors such as Resend/Supabase) this
// placeholder does not yet state.
export default function PrivacyPage() {
  return (
    <div className="container-site max-w-2xl py-20">
      <h1 className="font-display text-display-md">Privacy Policy</h1>
      <p className="mt-6 text-ink/70">
        [PLACEHOLDER: full privacy policy — lawful basis for processing enquiry data, retention
        period, sub-processors (e.g. email delivery, hosting, database), and the client&apos;s
        rights under UK GDPR. Draft before launch.]
      </p>
      <p className="mt-6 text-ink/70">
        In the meantime: when you submit the contact form, {siteConfig.businessName} stores your
        name, contact details and message only to respond to your enquiry.
      </p>
    </div>
  );
}
