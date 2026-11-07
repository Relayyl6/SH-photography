import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession, sessions } from "@/lib/sessions";
import { getSessionBySlug, getPortfolioImages } from "@/lib/content";
import { getGalleryImages } from "@/lib/gallery";
import { GalleryGrid } from "@/components/GalleryGrid";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return sessions.map((s) => ({ session: s.slug }));
}

export async function generateMetadata({ params }: { params: { session: string } }): Promise<Metadata> {
  const staticSession = getSession(params.session);
  if (staticSession) {
    return { title: staticSession.title, description: staticSession.intro };
  }
  const dynamicSession = await getSessionBySlug(params.session);
  if (dynamicSession) {
    return { title: dynamicSession.name, description: dynamicSession.shortDescription || dynamicSession.description };
  }
  return {};
}

export default async function SessionPage({ params }: { params: { session: string } }) {
  const dynamicSession = await getSessionBySlug(params.session);
  const staticSession = getSession(params.session);

  if (!staticSession && !dynamicSession) {
    notFound();
  }

  const title = dynamicSession?.name || staticSession?.title || "Session";
  const intro = dynamicSession?.shortDescription || dynamicSession?.description || staticSession?.intro || "";
  const slug = dynamicSession?.slug || staticSession?.slug || params.session;
  const count = staticSession?.galleryCount;

  // Merge uploaded Firestore photos with static baseline photos
  const portfolioDocs = await getPortfolioImages(slug);
  const uploadedPhotos = portfolioDocs.map((p) => ({
    src: p.url,
    width: p.width || 1200,
    height: p.height || 1500,
    aspectRatio: (p.width && p.height) ? p.width / p.height : 0.8,
    alt: p.alt || `${title} photo`,
    title: p.caption || title,
  }));
  const baselinePhotos = staticSession ? getGalleryImages(slug) : [];
  const usedSrcs = new Set(uploadedPhotos.map((p) => p.src).filter(Boolean));
  const mergedPhotos = [
    ...uploadedPhotos,
    ...baselinePhotos.filter((p) => !p.src || !usedSrcs.has(p.src)),
  ];
  const finalPhotos = mergedPhotos.length > 0 ? mergedPhotos : undefined;

  return (
    <div className="container-site py-20">
      <Link href="/portfolio" className="text-sm font-semibold underline underline-offset-4">
        ← All sessions
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Session</p>
      <h1 className="mt-3 font-display text-display-lg">{title}</h1>
      <p className="mt-4 max-w-xl text-ink/70">{intro}</p>

      <div className="mt-14">
        <GalleryGrid
          sessionSlug={slug}
          sessionTitle={title}
          count={count}
          initialPhotos={finalPhotos}
        />
      </div>
    </div>
  );
}
