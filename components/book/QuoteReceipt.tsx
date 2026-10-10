'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookingFormData } from './schema';
import { siteConfig } from '@/lib/site-config';
import { Check, Printer, MessageCircle, Copy, CheckCheck, Home, ArrowLeft } from 'lucide-react';

interface QuoteReceiptProps {
  data: BookingFormData;
  onReset?: () => void;
}

function formatTimeLabel(hhmm?: string) {
  if (!hhmm) return '';
  const [hStr = '0', mStr = '00'] = hhmm.split(':');
  const h = Number(hStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${mStr} ${period}`;
}

export function QuoteReceipt({ data, onReset }: QuoteReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [quoteRef] = useState(() => `SHQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Build formatted text message for WhatsApp or copying
  const buildQuoteText = () => {
    const lines = [
      `📸 *SH PHOTOGRAPHY — BESPOKE QUOTE REQUEST*`,
      `*Ref:* ${quoteRef}`,
      `*Date:* ${currentDate}`,
      ``,
      `*CLIENT INFORMATION*`,
      `• *Name:* ${data.fullName}`,
      `• *Email:* ${data.email}`,
      `• *Phone:* ${data.phone}`,
      data.companyName ? `• *Company:* ${data.companyName}` : null,
      data.instagramHandle ? `• *Instagram:* ${data.instagramHandle}` : null,
      `• *Preferred Contact:* ${data.preferredContact}`,
      ``,
      `*SESSION DETAILS*`,
      `• *Service:* ${data.serviceCategory}${data.sessionSubType ? ` (${data.sessionSubType})` : ''}`,
      `• *Preferred Date:* ${data.preferredDate} at ${formatTimeLabel(data.preferredStartTime)}`,
      `• *Date Flexible:* ${data.dateFlexible}`,
      data.alternateDate ? `• *Alternate Date:* ${data.alternateDate}` : null,
      data.estimatedDuration ? `• *Duration:* ${data.estimatedDuration}` : null,
      data.numSubjects ? `• *Subjects:* ${data.numSubjects}` : null,
      ``,
      `*LOCATION & LOGISTICS*`,
      `• *Location Type:* ${data.locationType}`,
      data.address ? `• *Address:* ${data.address}` : null,
      data.cityPostcode ? `• *City/Postcode:* ${data.cityPostcode}` : null,
      data.indoorsOutdoors ? `• *Setting:* ${data.indoorsOutdoors}` : null,
      `• *Travel Required:* ${data.travelRequired === 'Yes' ? (data.travelDetails || 'Yes') : 'No'}`,
      data.parkingNotes ? `• *Access/Parking:* ${data.parkingNotes}` : null,
      ``,
      `*CREATIVE BRIEF*`,
      `• *Vision:* "${data.vision}"`,
      `• *Style Preferences:* ${data.stylePreferences.join(', ')}`,
      `• *Color:* ${data.colorPreference}`,
      data.inspirationLinks ? `• *Inspiration:* ${data.inspirationLinks}` : null,
      data.mustHaveShots ? `• *Must-Have Shots:* ${data.mustHaveShots}` : null,
      data.specialRequests ? `• *Special Requests:* ${data.specialRequests}` : null,
      ``,
      `*DELIVERABLES & BUDGET*`,
      `• *Deliverables:* ${data.deliverables.join(', ')}`,
      data.editedImagesExpected ? `• *Images Expected:* ${data.editedImagesExpected}` : null,
      `• *Turnaround:* ${data.turnaroundTime}`,
      data.usageRights ? `• *Usage:* ${data.usageRights}` : null,
      `• *Second Shooter:* ${data.secondShooter}`,
      `• *Budget Range:* ${data.budgetRange} (Flexible: ${data.budgetFlexible})`,
      `• *Booking Urgency:* ${data.howSoon}`,
      ``,
      `*Studio:* ${siteConfig.businessName} (${siteConfig.owner})`,
      `*Contact:* ${siteConfig.phoneDisplay} | ${siteConfig.email}`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildQuoteText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Clean client phone digits for direct WhatsApp linking
  const cleanClientPhone = data.phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(buildQuoteText());

  const studioWhatsAppUrl = `https://wa.me/${siteConfig.whatsappE164}?text=${encodedMessage}`;
  const clientWhatsAppUrl = cleanClientPhone
    ? `https://wa.me/${cleanClientPhone}?text=${encodedMessage}`
    : null;

  return (
    <div className="w-full py-8 md:py-12">
      {/* Global Print Stylesheet to format print page cleanly */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header,
          footer,
          nav,
          .no-print,
          .no-print * {
            display: none !important;
          }
          .printable-quote-root {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .printable-quote-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Screen Success Notice (Hidden in Print) */}
      <div className="no-print max-w-3xl mx-auto text-center px-4 mb-10">
        <div className="w-16 h-16 bg-[#faf7f2] border border-ink text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Check size={32} />
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-ink mb-3 tracking-tight">
          Request Received
        </h2>
        <p className="text-ink/70 text-base md:text-lg max-w-xl mx-auto mb-6 leading-relaxed">
          Thank you, <span className="font-semibold text-ink">{data.fullName}</span>. Your bespoke quote request has been generated. You can print/save the official quote below or send it directly via WhatsApp.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-2">
          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-paper rounded-full font-semibold text-sm hover:bg-accent transition-all duration-300 shadow-sm"
          >
            <Printer size={18} />
            <span>Print Quote / Save PDF</span>
          </button>

          {/* Send to WhatsApp (Studio / Client) */}
          <a
            href={studioWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] text-white rounded-full font-semibold text-sm hover:bg-[#1EBE5D] transition-all duration-300 shadow-sm"
          >
            <MessageCircle size={18} />
            <span>Send to WhatsApp (Studio)</span>
          </a>

          {clientWhatsAppUrl && (
            <a
              href={clientWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-ink/20 bg-paper text-ink rounded-full font-semibold text-sm hover:border-ink hover:bg-sand transition-all duration-300 shadow-sm"
            >
              <MessageCircle size={18} />
              <span>Send to Client&apos;s WhatsApp</span>
            </a>
          )}

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-5 py-3.5 border border-line bg-white text-ink rounded-full font-medium text-sm hover:bg-sand transition-colors"
          >
            {copied ? <CheckCheck size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Quote Text'}</span>
          </button>

          {/* Return Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-ink/70 hover:text-ink transition-colors"
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>

      {/* The Printable Quote Document */}
      <div className="printable-quote-root max-w-4xl mx-auto px-4">
        <div className="printable-quote-card bg-white border border-line/80 rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm text-ink">
          
          {/* Quote Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-line gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                <Image
                  src="/logo.png"
                  alt="SH Photography"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  {siteConfig.businessName}
                </h1>
                <p className="text-xs uppercase tracking-widest text-ink/60 font-medium">
                  Bespoke Photography Quote Request
                </p>
                <p className="text-xs text-ink/50 mt-0.5">
                  {siteConfig.locationLine}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-sand text-ink rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Pending Review
              </span>
              <p className="text-sm font-mono font-medium text-ink">
                {quoteRef}
              </p>
              <p className="text-xs text-ink/60 mt-0.5">
                Date: {currentDate}
              </p>
            </div>
          </div>

          {/* Client & Booking Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-line text-sm">
            {/* Client Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-widest text-accent">
                Client Details
              </h3>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Full Name:</span>
                <span className="col-span-2 font-medium">{data.fullName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Email:</span>
                <span className="col-span-2 font-medium break-all">{data.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Phone:</span>
                <span className="col-span-2 font-medium">{data.phone}</span>
              </div>
              {data.companyName && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-ink/60">Company:</span>
                  <span className="col-span-2 font-medium">{data.companyName}</span>
                </div>
              )}
              {data.instagramHandle && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-ink/60">Instagram:</span>
                  <span className="col-span-2 font-medium">{data.instagramHandle}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Preferred Contact:</span>
                <span className="col-span-2 font-medium">{data.preferredContact}</span>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-widest text-accent">
                Session &amp; Schedule
              </h3>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Service:</span>
                <span className="col-span-2 font-medium">{data.serviceCategory}</span>
              </div>
              {data.sessionSubType && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-ink/60">Sub-Type:</span>
                  <span className="col-span-2 font-medium">{data.sessionSubType}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Preferred Date:</span>
                <span className="col-span-2 font-medium">
                  {data.preferredDate} ({formatTimeLabel(data.preferredStartTime)})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-ink/60">Date Flexible:</span>
                <span className="col-span-2 font-medium">{data.dateFlexible}</span>
              </div>
              {data.alternateDate && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-ink/60">Alternate Date:</span>
                  <span className="col-span-2 font-medium">{data.alternateDate}</span>
                </div>
              )}
              {data.estimatedDuration && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-ink/60">Duration:</span>
                  <span className="col-span-2 font-medium">{data.estimatedDuration}</span>
                </div>
              )}
              {data.numSubjects && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-ink/60">Subjects:</span>
                  <span className="col-span-2 font-medium">{data.numSubjects}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Logistics */}
          <div className="py-8 border-b border-line text-sm space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-accent">
              Location &amp; Logistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink/60">Location Type:</span>
                  <span className="font-medium">{data.locationType}</span>
                </div>
                {data.indoorsOutdoors && (
                  <div className="flex justify-between">
                    <span className="text-ink/60">Setting:</span>
                    <span className="font-medium">{data.indoorsOutdoors}</span>
                  </div>
                )}
                {data.cityPostcode && (
                  <div className="flex justify-between">
                    <span className="text-ink/60">City / Postcode:</span>
                    <span className="font-medium">{data.cityPostcode}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink/60">Travel Required:</span>
                  <span className="font-medium">{data.travelRequired}</span>
                </div>
                {data.travelDetails && (
                  <div className="text-xs text-ink/70">
                    <span className="font-medium">Travel details:</span> {data.travelDetails}
                  </div>
                )}
                {data.parkingNotes && (
                  <div className="text-xs text-ink/70">
                    <span className="font-medium">Access/Parking:</span> {data.parkingNotes}
                  </div>
                )}
              </div>
            </div>
            {data.address && (
              <p className="text-xs text-ink/80 pt-1">
                <span className="font-semibold text-ink/60">Full Venue Address:</span> {data.address}
              </p>
            )}
          </div>

          {/* Creative Brief & Deliverables */}
          <div className="py-8 border-b border-line text-sm space-y-6">
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-widest text-accent mb-2">
                Creative Direction &amp; Vision
              </h3>
              <p className="text-ink/90 italic bg-sand/40 p-4 rounded-xl border border-line/40">
                &ldquo;{data.vision}&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-ink/60 block">Selected Aesthetics</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.stylePreferences.map((style) => (
                    <span key={style} className="px-2.5 py-1 bg-paper border border-line rounded-md text-xs font-medium">
                      {style}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-ink/70 pt-2">
                  <span className="font-medium">Color Preference:</span> {data.colorPreference}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-ink/60 block">Deliverables Requested</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.deliverables.map((d) => (
                    <span key={d} className="px-2.5 py-1 bg-paper border border-line rounded-md text-xs font-medium">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="pt-2 text-xs space-y-1 text-ink/70">
                  <p><span className="font-medium">Turnaround:</span> {data.turnaroundTime}</p>
                  <p><span className="font-medium">Second Shooter:</span> {data.secondShooter}</p>
                  {data.editedImagesExpected && (
                    <p><span className="font-medium">Expected Images:</span> {data.editedImagesExpected}</p>
                  )}
                </div>
              </div>
            </div>

            {data.mustHaveShots && (
              <div className="text-xs text-ink/80">
                <span className="font-semibold text-ink/60 block mb-1">Must-Have Shots:</span>
                <p className="bg-paper p-3 rounded-lg border border-line/50">{data.mustHaveShots}</p>
              </div>
            )}
          </div>

          {/* Budget & Next Steps */}
          <div className="py-8 border-b border-line text-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-widest text-accent mb-2">
                Investment Indication
              </h3>
              <p className="text-base font-semibold text-ink">
                Guide Range: {data.budgetRange}
              </p>
              <p className="text-xs text-ink/60 mt-1">
                Flexibility: {data.budgetFlexible} · Booking Timeframe: {data.howSoon}
              </p>
              <p className="text-xs text-ink/50 mt-3 leading-relaxed">
                * Final pricing is personalized based on location, travel, and custom coverage requirements.
              </p>
            </div>

            <div className="bg-paper/70 p-5 rounded-xl border border-line/60">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-ink mb-2">
                Next Steps &amp; Confirmation
              </h4>
              <ul className="text-xs text-ink/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">1.</span>
                  <span>Benedict Henry reviews your schedule and requirements within 24–48 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">2.</span>
                  <span>A bespoke quote and formal proposal will be sent via WhatsApp/Email.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">3.</span>
                  <span>A deposit invoice is issued to secure your date on the shoot calendar.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink/60 gap-4">
            <div>
              <p className="font-semibold text-ink">{siteConfig.owner} · {siteConfig.businessName}</p>
              <p>{siteConfig.email} · {siteConfig.phoneDisplay}</p>
            </div>
            <div className="sm:text-right">
              <p>Manchester, United Kingdom · Available to travel</p>
              <p className="text-[10px] text-ink/40 mt-0.5">© {new Date().getFullYear()} SH Photography. All rights reserved.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
