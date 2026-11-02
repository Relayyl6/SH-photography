import type { Metadata } from "next";
import { packages as baselinePackages, packageQuoteCopy } from "@/lib/packages";
import { getPackages } from "@/lib/content";
import { PackageCard } from "@/components/PackageCard";
import type { Package } from "@/lib/packages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: "Photography services and classes — what's included, no prices shown by default.",
};

const howItWorks = ["Enquire", "Consult", "Shoot", "Delivery"];

export default async function ServicesPage() {
  const dbPackages = await getPackages();

  const allPackages: Package[] = dbPackages.map((p) => {
    const fallback = baselinePackages.find((bp) => bp.slug === p.sessionSlug || bp.slug === p.id);
    return {
      slug: p.sessionSlug || p.id,
      name: p.name,
      category: p.category as "photography" | "class",
      image: fallback?.image || `/photos/${p.sessionSlug || p.id}/${p.sessionSlug || p.id}_01.jpg`,
      summary: p.description,
      includes: p.features,
      notes: fallback?.notes,
      format: fallback?.format,
      showPrice: p.show_price,
      priceLabel: p.price_label || null,
      ctaLabel: fallback?.ctaLabel || "Request a quote",
    };
  });

  const photographyPackages = allPackages.filter((p) => p.category === "photography");
  const classPackages = allPackages.filter((p) => p.category === "class");

  return (
    <div id="packages" className="container-site py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Services &amp; Pricing</p>
      <h1 className="mt-3 max-w-2xl font-display text-display-lg">What each package gives you</h1>
      <p className="mt-6 max-w-xl text-ink/70">{packageQuoteCopy}</p>

      <ol className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {howItWorks.map((step, i) => (
          <li key={step} className="border-t-2 border-ink pt-3">
            <span className="text-xs text-ink/40">0{i + 1}</span>
            <p className="font-display text-lg">{step}</p>
          </li>
        ))}
      </ol>

      <section className="mt-20">
        <h2 className="font-display text-display-md">Photography services</h2>
        <p className="mt-2 text-ink/60">Tailored editorial and documentary photography across Manchester and worldwide.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photographyPackages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-display-md">Classes</h2>
        <p className="mt-2 text-ink/60">Photography and retouching — retouching available online or in person.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {classPackages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </section>
    </div>
  );
}
