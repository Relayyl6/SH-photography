import type { Metadata } from "next";
import Link from "next/link";
import { sessions } from "@/lib/sessions";
import { SessionPreviewCarousel } from "@/components/SessionPreviewCarousel";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Curated portfolio sessions by Benedict Henry — Weddings, Portraits, Family, Events, Sports, Birthdays, Personal Branding, Behind the Scenes, Corporate.",
};

export default function PortfolioPage() {
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
            />
            <h2 className="mt-4 font-display text-2xl group-hover:text-accent transition-colors">{session.title}</h2>
            <p className="mt-1 text-sm text-ink/60 line-clamp-2">{session.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
