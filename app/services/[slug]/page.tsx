import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { packages } from "@/lib/packages";

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

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = params;
  const pkg = packages.find((p) => p.slug === slug);
  if (!pkg) notFound();

  const isClass = pkg.category === "class";

  const formatLabel =
    pkg.format === "both"
      ? "Online / In Person"
      : pkg.format === "online"
      ? "Online"
      : pkg.format === "in_person"
      ? "In Person"
      : null;

  return (
    <div className="bg-paper text-ink min-h-screen">
      <div className="container-site py-20">
        {/* Back navigation */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-accent transition-colors mb-12"
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
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>

        <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
          {/* Main content */}
          <div>
            {/* Category + format badge row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                {isClass ? "Class" : "Photography"}
              </span>
              {formatLabel && (
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70">
                  {formatLabel}
                </span>
              )}
            </div>

            {/* Heading */}
            <h1 className="font-display text-display-lg text-ink">{pkg.name}</h1>

            {/* Summary */}
            <p className="mt-6 max-w-2xl text-lg text-ink/70 leading-relaxed">
              {pkg.summary}
            </p>

            {/* What&apos;s included */}
            <section className="mt-12">
              <h2 className="font-display text-2xl mb-6">What&apos;s included</h2>
              <ul className="space-y-4">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-ink/80">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold"
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Classes-only: delivery note */}
            {isClass && (
              <section className="mt-12 rounded-2xl border border-line bg-sand p-6">
                <h2 className="font-display text-xl mb-2">How it works</h2>
                <p className="text-ink/70 text-sm leading-relaxed">
                  This class is available both{" "}
                  <strong>online</strong> and{" "}
                  <strong>in person</strong> in Manchester. When you request a
                  booking, simply let me know which format suits you — I&apos;ll
                  confirm availability and send a personalised plan.
                </p>
              </section>
            )}

            {/* Notes */}
            {pkg.notes && (
              <p className="mt-8 text-sm text-ink/50 italic">{pkg.notes}</p>
            )}
          </div>

          {/* Sticky CTA sidebar */}
          <div>
            <div className="lg:sticky lg:top-28 rounded-2xl border border-line bg-sand p-8 flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-2">
                  Interested?
                </p>
                <h2 className="font-display text-2xl text-ink">
                  Get a personalised quote
                </h2>
                <p className="mt-3 text-sm text-ink/60 leading-relaxed">
                  Every session is tailored to you. Pricing depends on your
                  requirements, location and duration — get in touch and I&apos;ll
                  put together a custom quote.
                </p>
              </div>

              {/* No price ever shown here */}

              <Link
                href={`/book?service=${pkg.slug}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
              >
                {isClass ? "Book this class" : "Request a Quote"}
              </Link>

              {isClass && (
                <Link
                  href={`/book?service=${pkg.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-ink/30 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                  Request a Quote instead
                </Link>
              )}

              <p className="text-xs text-ink/40 text-center">
                No payment required to enquire. I&apos;ll be in touch within 24–48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
