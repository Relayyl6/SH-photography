import type { Metadata } from "next";
import { packages, packageQuoteCopy } from "@/lib/packages";
import { PackageCard } from "@/components/PackageCard";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: "Photography services and classes — what's included, no prices shown.",
};

const howItWorks = ["Enquire", "Consult", "Shoot", "Delivery"]; // [SUGGESTED]

export default function ServicesPage() {
  const photographyPackages = packages.filter((p) => p.category === "photography");
  const classPackages = packages.filter((p) => p.category === "class");

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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
