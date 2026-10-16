import Link from "next/link";
import type { Package } from "@/lib/packages";

// show_price is read here and only here (DATA-MODEL.md §2.1) — never
// render a price unless the flag is true. Currently always false.
// On base /services, the includes checklist is hidden per client request;
// full inclusions are displayed on the dedicated /services/[slug] detail pages.
export function PackageCard({ pkg, showIncludes = false }: { pkg: Package; showIncludes?: boolean }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:border-ink/40 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl">{pkg.name}</h3>
          {pkg.format && (
            <span className="shrink-0 rounded-full bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70">
              {pkg.format === "both" ? "Online / In person" : pkg.format === "online" ? "Online" : "In person"}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm text-ink/70 leading-relaxed">{pkg.summary}</p>

        {showIncludes && (
          <>
            <ul className="mt-4 space-y-2 text-sm text-ink/80">
              {pkg.includes.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="text-accent">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {pkg.notes && <p className="mt-4 text-xs text-ink/50">{pkg.notes}</p>}
          </>
        )}

        {pkg.showPrice && pkg.priceLabel ? (
          <p className="mt-4 font-display text-lg">{pkg.priceLabel}</p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/services/${pkg.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/30 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-sand"
        >
          View Details
        </Link>
        <Link
          href={`/book?service=${pkg.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
        >
          {pkg.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
