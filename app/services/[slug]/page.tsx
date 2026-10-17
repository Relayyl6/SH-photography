import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { packages } from "@/lib/packages";
import { siteConfig } from "@/lib/site-config";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) return {};
  return {
    title: `${pkg.name} — SH Photography`,
    description: pkg.summary,
  };
}

import { serviceMedia, defaultMedia } from "@/lib/service-media";


export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = params;
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) notFound();

  const isClass = pkg.category === "class";
  const media = serviceMedia[slug] ?? defaultMedia;

  const formatLabel =
    pkg.format === "both"
      ? "Online / In Person"
      : pkg.format === "online"
      ? "Online"
      : pkg.format === "in_person"
      ? "In Person"
      : null;

  const whatsappMessage = encodeURIComponent(
    `Hi Benedict, I'm interested in booking your ${pkg.name} service. Could you please share more details and availability?`
  );

  return (
    <div className="bg-paper text-ink min-h-screen">
      <div className="container-site py-16 md:py-20">
        {/* Back navigation */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-accent transition-colors mb-8 sm:mb-12"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to all services &amp; classes
        </Link>

        {/* Top Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            <div>
              {/* Category & Format Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink/80 border border-line">
                  {isClass ? "Masterclass" : "Photography Service"}
                </span>
                {formatLabel && (
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent border border-accent/30">
                    {formatLabel}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink tracking-tight font-medium leading-[1.05]">
                {pkg.name}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl">
                {pkg.summary}
              </p>
            </div>

            {/* Inclusions Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-line bg-sand/40 p-6 sm:p-8">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-semibold mb-4">
                What&apos;s Included in This {isClass ? "Class" : "Session"}
              </h2>
              <ul className="space-y-3.5 text-sm sm:text-base text-ink/85">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {pkg.notes && (
                <div className="mt-6 border-t border-line/60 pt-4">
                  <p className="text-xs sm:text-sm text-ink/60 italic leading-relaxed">
                    Note: {pkg.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Class-Specific Format Details */}
            {isClass && (
              <div className="rounded-2xl sm:rounded-3xl border border-line/70 bg-paper p-6 sm:p-8 flex flex-col gap-4">
                <h3 className="font-display text-lg sm:text-xl font-semibold">
                  How Classes Are Delivered
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-ink/75">
                  <div className="rounded-xl border border-line/60 bg-sand/30 p-4">
                    <p className="font-semibold text-ink mb-1">💻 Online Sessions</p>
                    <p className="text-xs leading-relaxed">
                      Conducted via high-definition screen sharing with live software demonstrations, project file breakdowns, and recorded sessions for your archives.
                    </p>
                  </div>
                  <div className="rounded-xl border border-line/60 bg-sand/30 p-4">
                    <p className="font-semibold text-ink mb-1">📍 In-Person Studio (Manchester)</p>
                    <p className="text-xs leading-relaxed">
                      Hands-on studio guidance with real camera equipment, tethered shooting workflows, and tactile lighting control directly beside Benedict.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Floating Conversion CTA Card */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-28 rounded-2xl sm:rounded-3xl border border-line bg-sand/80 backdrop-blur-md p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-wider mb-2">
                  Tailored To You
                </span>
                <h2 className="font-display text-2xl text-ink font-semibold">
                  Get a Personalised Quote
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-ink/70 leading-relaxed">
                  Every shoot is unique. Final pricing depends on your date, venue, hours, and creative vision.
                  Request a custom quote in under 2 minutes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {/* Primary Booking Wizard CTA */}
                <Link
                  href={`/book?service=${pkg.slug}`}
                  scroll={true}
                  className="group/btn relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-semibold tracking-wide text-paper shadow-md transition-all duration-300 hover:bg-accent hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{isClass ? "Book This Class" : "Request a Quote"}</span>
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                </Link>

                {/* Direct WhatsApp Route */}
                <a
                  href={`https://wa.me/${siteConfig.whatsappE164}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 bg-paper/60 px-6 py-3.5 text-xs sm:text-sm font-semibold text-ink transition-all duration-300 hover:border-emerald-600 hover:text-emerald-700 hover:bg-white hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>

                {/* Direct Contact Form Route */}
                <Link
                  href={`/contact?service=${pkg.slug}`}
                  scroll={true}
                  className="inline-flex w-full items-center justify-center rounded-full border border-ink/15 px-6 py-2.5 text-xs font-semibold text-ink/70 transition-colors hover:text-ink hover:border-ink/40"
                >
                  Send a message via Contact Form
                </Link>
              </div>

              <div className="border-t border-line/60 pt-4 text-center">
                <p className="text-[11px] text-ink/50 leading-relaxed">
                  ✓ No upfront payment required to enquire <br />
                  ✓ Benedict responds within 24–48 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Visual Showcase Section Depicting The Service ---------- */}
        <section className="mt-20 md:mt-28 border-t border-line/60 pt-16 md:pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-2">
                Visual Showcase
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-tight font-medium">
                Depicting {pkg.name}
              </h2>
            </div>
            <p className="text-sm text-ink/60 max-w-md italic">
              &quot;{media.styleQuote}&quot;
            </p>
          </div>

          {/* Panoramic Feature Photograph - Refined Proportions with Corner Marks */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] max-h-[380px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-ink border border-line/40 group">
            <Image
              src={media.hero.src}
              alt={media.hero.alt}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

            {/* Subtle photographic corner crop marks ("corner edge line stuff") */}
            <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/60 pointer-events-none z-10 drop-shadow-sm" />
            <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/60 pointer-events-none z-10 drop-shadow-sm" />
            <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white/60 pointer-events-none z-10 drop-shadow-sm" />
            <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white/60 pointer-events-none z-10 drop-shadow-sm" />

            {/* Top Bar Archive Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="text-[9px] uppercase tracking-widest text-paper/80 font-mono bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/15">
                SH Archive · MCR
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 z-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white border border-white/30 mb-2">
                  Featured Shot
                </span>
                <p className="font-display text-xl sm:text-2xl text-white font-medium">
                  {pkg.name} by SH Photography
                </p>
                <p className="text-xs sm:text-sm text-white/80 mt-1">
                  {media.hero.caption}
                </p>
              </div>

              <Link
                href={`/book?service=${pkg.slug}`}
                className="inline-flex self-start sm:self-auto items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
              >
                <span>Book This Look</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Supporting 3-Picture Editorial Gallery Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {media.gallery.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-ink border border-line/40 shadow-md transition-all duration-500 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                  {/* Corner marks */}
                  <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-white/50 pointer-events-none z-10" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-white/50 pointer-events-none z-10" />

                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-3.5 sm:left-3.5 sm:right-3.5">
                    <p className="font-display text-base text-white font-medium leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-white/70 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Pre-footer Booking Prompt */}
          <div className="mt-14 rounded-2xl sm:rounded-3xl bg-sand/60 border border-line p-8 sm:p-12 text-center flex flex-col items-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
              Ready to Book?
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-ink font-semibold">
              Reserve Your {pkg.name} Date
            </h3>
            <p className="mt-3 text-sm text-ink/70 max-w-lg leading-relaxed">
              Dates fill quickly, especially across peak summer and autumn seasons. Submit an enquiry to check Benedict&apos;s availability and receive a custom quote.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                href={`/book?service=${pkg.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-paper shadow-md hover:bg-accent transition-colors"
              >
                <span>{isClass ? "Book This Class" : "Request a Quote"}</span>
                <span>→</span>
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsappE164}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper px-6 py-3.5 text-sm font-semibold text-ink hover:border-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
