import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy | SH Photography",
  description:
    "Privacy policy and UK GDPR data protection notice for SH Photography (Benedict Henry), based in Manchester, United Kingdom.",
};

export default function PrivacyPage() {
  return (
    <div className="container-site max-w-3xl py-16 md:py-24">
      {/* Breadcrumb / Top Tag */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:underline"
        >
          ← Back to home
        </Link>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-ink/60">
        Last updated: October 2026 · Operating in compliance with the UK GDPR and Data Protection Act 2018
      </p>

      <div className="mt-10 space-y-10 text-ink/80 text-base leading-relaxed border-t border-line/60 pt-10">
        {/* 1. Who We Are */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">1. Who We Are</h2>
          <p className="mt-3">
            <strong>{siteConfig.businessName}</strong> is an independent photography practice owned and
            operated by <strong>{siteConfig.owner}</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
            based in <strong>{siteConfig.location}</strong>. We provide professional photography services,
            editorial portraiture, wedding storytelling, and masterclasses across Greater Manchester, the
            United Kingdom, and internationally.
          </p>
          <p className="mt-2">
            For all data protection inquiries or to exercise any of your statutory rights, you can reach us
            directly at:{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-accent underline font-medium">
              {siteConfig.email}
            </a>{" "}
            or via telephone at{" "}
            <a href={`tel:${siteConfig.phoneE164}`} className="text-accent underline font-medium">
              {siteConfig.phoneDisplay}
            </a>
            .
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">2. Information We Collect</h2>
          <p className="mt-3">
            We only collect personal information that is reasonably necessary to respond to your inquiries,
            plan and execute commissioned shoots, and deliver your finished photographs. This includes:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Contact Details:</strong> Your full name, email address, telephone number, and
              preferred communication channel (Email, Phone, or WhatsApp).
            </li>
            <li>
              <strong>Event &amp; Creative Logistics:</strong> Shoot date, ceremony/reception venue addresses,
              session types (e.g. Wedding, Portrait, Family, Corporate), estimated durations, creative briefs,
              moodboards, and any special logistical instructions.
            </li>
            <li>
              <strong>Photographic Content:</strong> Digital RAW files, intermediate previews, and retouched
              high-resolution imagery captured during your booked sessions.
            </li>
            <li>
              <strong>Transactional Records:</strong> Invoices, quote requests, agreements, and payment
              confirmation records. We do not store or process payment card details directly.
            </li>
          </ul>
        </section>

        {/* 3. Lawful Basis for Processing */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">3. Lawful Basis for Processing (UK GDPR)</h2>
          <p className="mt-3">
            Under the UK General Data Protection Regulation (UK GDPR), we rely on the following lawful bases:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Performance of a Contract:</strong> Processing necessary to provide tailored quotes,
              coordinate shoot logistics, attend your session, and fulfill digital photo delivery.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Managing business communications, responding to contact
              inquiries, safeguarding creative intellectual property, and managing client satisfaction.
            </li>
            <li>
              <strong>Consent:</strong> Explicit permission obtained prior to featuring any commissioned client
              photographs on our public portfolio, social channels, or marketing materials. You may withdraw
              this consent at any time.
            </li>
            <li>
              <strong>Legal Obligation:</strong> Maintaining required accounting, invoicing, and tax records
              as mandated by UK HMRC.
            </li>
          </ul>
        </section>

        {/* 4. Sub-Processors & Data Sharing */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">4. How Your Data Is Stored &amp; Shared</h2>
          <p className="mt-3">
            We never sell, rent, or trade your personal information. We only share data with trusted
            third-party infrastructure providers who adhere to strict data security standards:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Hosting &amp; Compute:</strong> Vercel Inc. (secure web application deployment).
            </li>
            <li>
              <strong>Database Infrastructure:</strong> Supabase Inc. / Neon Inc. (encrypted PostgreSQL
              database storage for enquiry management).
            </li>
            <li>
              <strong>Transactional Email:</strong> Resend Inc. (delivering booking confirmations and quote
              notifications).
            </li>
            <li>
              <strong>Messaging:</strong> Meta Platforms / WhatsApp (when you elect to initiate an inquiry
              via the WhatsApp route).
            </li>
          </ul>
        </section>

        {/* 5. Data Retention */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">5. Data Retention</h2>
          <p className="mt-3">
            General website contact inquiries that do not result in a confirmed booking are retained for up
            to 12 months, after which they are safely deleted. Commissioned client contracts, invoices, and
            shoot records are retained for 6 years in accordance with statutory UK accounting and HMRC
            regulations. High-resolution master photograph galleries are archived for a minimum of 2 years
            to allow clients to request backup downloads.
          </p>
        </section>

        {/* 6. Your Rights */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">6. Your Statutory Rights</h2>
          <p className="mt-3">
            Under the UK GDPR and Data Protection Act 2018, you possess rights regarding your data:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Right to Access:</strong> You can request a copy of the personal information we hold
              about you.
            </li>
            <li>
              <strong>Right to Rectification:</strong> You can ask us to correct inaccurate or incomplete
              details.
            </li>
            <li>
              <strong>Right to Erasure:</strong> You can request deletion of your information, subject to
              our legal and tax retention duties.
            </li>
            <li>
              <strong>Right to Object or Restrict:</strong> You can object to specific uses of your data or
              request restrictions on its processing.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Where processing is based on consent (such as image
              portfolio showcase), you have the right to withdraw it at any moment.
            </li>
          </ul>
          <p className="mt-4">
            If you are unsatisfied with our response, you have the right to lodge a complaint with the UK
            Information Commissioner&apos;s Office (ICO) at{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline font-medium"
            >
              ico.org.uk
            </a>
            .
          </p>
        </section>

        {/* 7. Cookies & Analytics */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">7. Cookies &amp; Analytics</h2>
          <p className="mt-3">
            Our website uses privacy-friendly, cookieless performance metrics. We do not use third-party
            advertising tracking cookies, nor do we track your browsing activity across other websites.
            Embedded video players (such as YouTube tutorial previews) utilize privacy-enhanced mode
            (&quot;youtube-nocookie.com&quot;) and are loaded only upon your explicit interaction.
          </p>
        </section>

        {/* 8. Contact Us */}
        <section className="border-t border-line/60 pt-8">
          <h2 className="font-display text-2xl text-ink font-semibold">8. Questions &amp; Contact</h2>
          <p className="mt-3">
            If you have questions regarding this Privacy Policy or wish to request data updates, please
            contact Benedict Henry directly at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-accent underline font-semibold">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
