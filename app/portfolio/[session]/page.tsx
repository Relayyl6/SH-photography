import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession, sessions } from "@/lib/sessions";
import { GalleryGrid } from "@/components/GalleryGrid";

export function generateStaticParams() {
  return sessions.map((s) => ({ session: s.slug }));
}

export function generateMetadata({ params }: { params: { session: string } }): Metadata {
  const session = getSession(params.session);
  if (!session) return {};
  return { title: session.title, description: session.intro };
}

export default function SessionPage({ params }: { params: { session: string } }) {
  const session = getSession(params.session);
  if (!session) notFound();

  return (
    <div className="container-site py-20">
      <Link href="/portfolio" className="text-sm font-semibold underline underline-offset-4">
        ← All sessions
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Session</p>
      <h1 className="mt-3 font-display text-display-lg">{session.title}</h1>
      <p className="mt-4 max-w-xl text-ink/70">{session.intro}</p>

      <div className="mt-14">
        <GalleryGrid sessionTitle={session.title} count={session.galleryCount} />
      </div>
    </div>
  );
}
