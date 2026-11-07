import type { Metadata } from "next";
import Link from "next/link";
import { getSessions, getPortfolioImages } from "@/lib/content";
import { SessionPreviewCarousel } from "@/components/SessionPreviewCarousel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Curated portfolio sessions by Benedict Henry — Weddings, Portraits, Family, Events, Sports, Birthdays, Personal Branding, Behind the Scenes.",
};

export default async function PortfolioPage() {
  const dbSessions = await getSessions();

  // Get uploaded portfolio images for all sessions in parallel
  const portfolioImagesMap = new Map<string, Array<{src: string; width: number; height: number; aspectRatio: number; alt: string; title: string}>>();
  await Promise.all(
    dbSessions.map(async (s) => {
      try {
        const docs = await getPortfolioImages(s.slug);
        if (docs.length > 0) {
          portfolioImagesMap.set(s.slug, docs.map((p) => ({
            src: p.url,
            width: p.width || 1200,
            height: p.height || 1500,
            aspectRatio: (p.width && p.height) ? p.width / p.height : 0.8,
            alt: p.alt || `${s.name} photo`,
            title: p.caption || s.name,
          })));
        }
      } catch {
        // fail silently per session
      }
    })
  );

  const sessions = dbSessions.map((s) => ({
    slug: s.slug,
    title: s.name,
    intro: s.shortDescription || s.description,
    previewCount: 6,
    uploadedPhotos: portfolioImagesMap.get(s.slug),
  }));
  return (
    <div className="container-site py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Portfolio</p>
      <h1 className="mt-3 font-display text-display-lg">The work, by session</h1>
      <p className="mt-4 max-w-xl text-ink/70">
        Authentic storytelling across live sessions and editorial events. Each preview keeps moving on its own — open one for the fuller gallery.
      </p>

      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Link key={session.slug} href={`/portfolio/${session.slug}`} className="group block">
            <SessionPreviewCarousel
              sessionSlug={session.slug}
              sessionTitle={session.title}
              count={session.previewCount}
              initialPhotos={session.uploadedPhotos}
            />
            <h2 className="mt-4 font-display text-2xl group-hover:text-accent transition-colors">{session.title}</h2>
            <p className="mt-1 text-sm text-ink/60 line-clamp-2">{session.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
