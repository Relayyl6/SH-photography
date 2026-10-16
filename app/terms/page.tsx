import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service | SH Photography",
  description:
    "Terms and conditions for photography commissions, sessions, and masterclasses with SH Photography (Benedict Henry) in Manchester, United Kingdom.",
};

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-ink/60">
        Effective date: October 2026 · Governing commissioned photography services &amp; masterclasses
      </p>

      <div className="mt-10 space-y-10 text-ink/80 text-base leading-relaxed border-t border-line/60 pt-10">
        {/* 1. Overview */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">1. Overview &amp; Agreement</h2>
          <p className="mt-3">
            These Terms of Service govern all photography bookings, bespoke shoots, portrait sessions, event
            coverage, and educational classes provided by <strong>{siteConfig.businessName}</strong>, operated
            by <strong>{siteConfig.owner}</strong> (&quot;the Photographer&quot;), based in{" "}
            <strong>{siteConfig.location}</strong>.
          </p>
          <p className="mt-2">
            By booking a session, submitting a quote request, or paying a booking deposit, you (&quot;the
            Client&quot;) agree to be bound by these Terms and Conditions.
          </p>
        </section>

        {/* 2. Booking & Confirmation */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">2. Bookings, Quotes &amp; Deposits</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Bespoke Quotes:</strong> All quotes provided via the website, email, or WhatsApp are
              custom-tailored based on date, location, duration, and creative scope. Quotes remain valid for
              14 days from issuance unless otherwise stated.
            </li>
            <li>
              <strong>Date Reservation:</strong> A booking is formally secured only upon receipt of a written
              confirmation agreement and a non-refundable booking deposit (typically 25%–30% of the total quote).
            </li>
            <li>
              <strong>Balance Payment:</strong> The remaining balance is due no later than 7 days prior to the
              scheduled shoot date (or on the wedding date timeline as agreed in the bespoke agreement).
            </li>
          </ul>
        </section>

        {/* 3. Rescheduling & Cancellations */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">3. Rescheduling &amp; Cancellations</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Client Rescheduling:</strong> If you need to postpone due to unforeseen circumstances, we
              request a minimum of 48 hours&apos; written notice. Deposits may be transferred to a mutually agreeable
              alternate date within 6 months, subject to calendar availability.
            </li>
            <li>
              <strong>Inclement Weather:</strong> For outdoor lifestyle or portrait shoots, sessions may be
              rescheduled without penalty if severe weather impairs equipment safety or creative execution.
            </li>
            <li>
              <strong>Photographer Cancellation:</strong> In the improbable event the Photographer is incapacitated
              due to serious illness or emergency, every effort will be made to provide a vetted associate
              photographer of equal calibre, or a 100% full refund of all monies paid will be promptly issued.
            </li>
          </ul>
        </section>

        {/* 4. Creative Discretion & Delivery */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">4. Creative Discretion &amp; Turnaround</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Artistic Style:</strong> The Client acknowledges that SH Photography works in a signature
              natural, vibrant, and documentary editorial aesthetic. The selection of images and the editing
              palette remain at the Photographer&apos;s artistic discretion.
            </li>
            <li>
              <strong>Turnaround Time:</strong> Standard portrait and event collections are delivered within
              2–3 weeks. Wedding collections are delivered within 4–6 weeks. Express sneak-peeks are typically
              delivered within 48 hours for immediate social sharing.
            </li>
            <li>
              <strong>Delivery Format:</strong> Completed photographs are provided via a private, high-resolution
              online digital gallery with full-resolution JPEG downloads. RAW files remain unreleased proprietary
              work assets.
            </li>
          </ul>
        </section>

        {/* 5. Copyright & Image Usage */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">5. Copyright, Licensing &amp; Usage Rights</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Ownership:</strong> In accordance with the UK Copyright, Designs and Patents Act 1988, the
              copyright in all photographs remains vested in Benedict Henry / SH Photography.
            </li>
            <li>
              <strong>Personal Print Release:</strong> For weddings, families, birthdays, and portraits, clients are
              granted a perpetual, royalty-free personal license to print, display, and share images across personal
              social media channels.
            </li>
            <li>
              <strong>Commercial Commissions:</strong> Commercial, branding, and advertising projects are granted
              specific usage licenses (digital, print, territorial, and duration) as detailed in the commercial quote.
            </li>
            <li>
              <strong>Portfolio Promotion:</strong> The Photographer reserves the reasonable right to display selected
              images in portfolio showcases, exhibitions, and social channels, subject to client consent.
            </li>
          </ul>
        </section>

        {/* 6. Classes & Masterclasses */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">6. Photography &amp; Retouching Classes</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Educational Material:</strong> Practice RAW files, brush packs, and recordings provided
              during classes are licensed solely for the enrolled student&apos;s personal learning and may not be
              resold, redistributed, or repackaged.
            </li>
            <li>
              <strong>Attendance &amp; Tech Requirements:</strong> For online sessions, attendees are responsible for
              ensuring a stable internet connection and compatible Adobe Photoshop / Lightroom installations.
            </li>
          </ul>
        </section>

        {/* 7. Limitation of Liability */}
        <section>
          <h2 className="font-display text-2xl text-ink font-semibold">7. Limitation of Liability</h2>
          <p className="mt-3">
            SH Photography maintains professional indemnity and public liability insurance. In any claim arising out
            of this agreement, the total liability of the Photographer shall be limited to the total sum paid by the
            Client for the specific booking.
          </p>
        </section>

        {/* 8. Governing Law */}
        <section className="border-t border-line/60 pt-8">
          <h2 className="font-display text-2xl text-ink font-semibold">8. Governing Law</h2>
          <p className="mt-3">
            These terms and conditions are governed by and construed in accordance with the laws of England and
            Wales, and both parties submit to the exclusive jurisdiction of the English courts.
          </p>
          <p className="mt-4 text-sm text-ink/60">
            For any contractual questions, please reach out directly:{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-accent underline font-semibold">
              {siteConfig.email}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
