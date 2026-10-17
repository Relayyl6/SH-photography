import Link from "next/link";
import Image from "next/image";
import type { Package } from "@/lib/packages";

// show_price is read here and only here (DATA-MODEL.md §2.1) — never
// render a price unless the flag is true. Currently always false.
// On base /services, the includes checklist is hidden per client request;
// full inclusions are displayed on the dedicated /services/[slug] detail pages.
export function PackageCard({ pkg, showIncludes = false }: { pkg: Package; showIncludes?: boolean }) {
  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-line/70 bg-paper overflow-hidden transition-all duration-500 hover:border-ink/50 hover:shadow-xl">
      <div>
        {/* Package Image Preview with Editorial Darkroom Styling */}
        {pkg.image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
            <Image
              src={pkg.image}
              alt={pkg.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
            
            {/* Fine art corner crop marks */}
            <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-white/60 pointer-events-none z-10 drop-shadow-sm" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-white/60 pointer-events-none z-10 drop-shadow-sm" />

            {/* Badges */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white z-10">
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                {pkg.category === "class" ? "Masterclass" : "Photography"}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-white/80 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                SH Archive
              </span>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl sm:text-2xl text-ink font-medium tracking-tight">
              {pkg.name}
            </h3>
            {pkg.format && (
              <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/70 border border-line/60">
                {pkg.format === "both" ? "Online / In Person" : pkg.format === "online" ? "Online" : "In Person"}
              </span>
            )}
          </div>

          <p className="mt-2.5 text-xs sm:text-sm text-ink/70 leading-relaxed">
            {pkg.summary}
          </p>

          {showIncludes && (
            <>
              <ul className="mt-4 space-y-2 text-xs sm:text-sm text-ink/80">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {pkg.notes && <p className="mt-4 text-xs text-ink/50 italic">{pkg.notes}</p>}
            </>
          )}

          {pkg.showPrice && pkg.priceLabel ? (
            <p className="mt-4 font-display text-lg">{pkg.priceLabel}</p>
          ) : null}
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={`/services/${pkg.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/25 px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-sand"
        >
          View Details
        </Link>
        <Link
          href={`/book?service=${pkg.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-ink px-4 py-2.5 text-xs sm:text-sm font-semibold text-paper transition-colors hover:bg-accent"
        >
          {pkg.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
