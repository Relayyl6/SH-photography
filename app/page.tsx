import Link from "next/link";
import { siteConfig, featuredVideoId } from "@/lib/site-config";
import { sessions } from "@/lib/sessions";
import { packages } from "@/lib/packages";
import { SessionPreviewCarousel } from "@/components/SessionPreviewCarousel";
import { VideoFacade } from "@/components/VideoFacade";
import { SocialLinks } from "@/components/SocialLinks";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export default function HomePage() {
  const serviceNames = packages.filter((p) => p.category === "photography").map((p) => p.name);
  const classNames = packages.filter((p) => p.category === "class").map((p) => p.name);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-paper">
        
        {/* Blurred Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover opacity-[0.25] blur-xl pointer-events-none select-none -z-10"
        >
          <source src="/photographer-bg.mp4" type="video/mp4" />
        </video>

        {/* Bottom Fade Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-paper to-transparent pointer-events-none -z-10"></div>

        <div className="relative container-site flex min-h-[92vh] flex-col justify-center py-20 z-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent drop-shadow-sm">
            {siteConfig.location} · Est. 2020
          </p>

          <h1 className="mt-6 font-display text-display-xl text-ink drop-shadow-sm">
            Photographing
            <br />
            <span className="italic text-accent">people,</span> brands
            <br />
            &amp; products
          </h1>

          <p className="mt-8 max-w-xl text-lg text-ink/80 drop-shadow-sm">{siteConfig.heroSubline}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
            >
              View my work
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-ink px-7 py-3.5 text-sm font-semibold bg-paper/50 backdrop-blur-sm transition-colors hover:bg-ink hover:text-paper"
            >
              Book a shoot
            </Link>
          </div>
        </div>

        <div className="relative container-site grid grid-cols-2 gap-4 pb-16 md:grid-cols-4 z-10">
          <PlaceholderImage label="Hero image 1" ratio="3 / 4" />
          <PlaceholderImage label="Hero image 2" ratio="3 / 4" className="mt-8" />
          <PlaceholderImage label="Hero image 3" ratio="3 / 4" />
          <PlaceholderImage label="Hero image 4" ratio="3 / 4" className="mt-8" />
        </div>
      </section>

      {/* ---------- Sessions ---------- */}
      <section className="container-site py-24">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Sessions</p>
            <h2 className="mt-3 font-display text-display-md">Five ways I tell your story</h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold underline underline-offset-4">
            See the full portfolio →
          </Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Link key={session.slug} href={`/portfolio/${session.slug}`} className="group block">
              <SessionPreviewCarousel sessionTitle={session.title} count={session.previewCount} />
              <h3 className="mt-4 font-display text-2xl group-hover:text-accent">{session.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{session.intro}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- About teaser ---------- */}
      <section className="border-y border-line bg-sand">
        <div className="container-site grid gap-12 py-24 md:grid-cols-2 md:items-center">
          <PlaceholderImage label="Benedict Henry — portrait" ratio="4 / 5" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Get to know me</p>
            <h2 className="mt-3 font-display text-display-md">Benedict Henry</h2>
            <p className="mt-6 max-w-lg text-ink/70">
              My photography style is all about natural storytelling. I strive to capture moments
              that feel authentic and timeless, aiming for perfection even before post-production.
            </p>
            <Link href="/about" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">
              Read my full story →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Services summary ---------- */}
      <section className="container-site py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">What I do</p>
        <h2 className="mt-3 font-display text-display-md">Services &amp; classes</h2>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Photography services</h3>
            <ul className="mt-4 space-y-3">
              {serviceNames.map((name) => (
                <li key={name} className="border-b border-line pb-3 font-display text-xl">
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Classes</h3>
            <ul className="mt-4 space-y-3">
              {classNames.map((name) => (
                <li key={name} className="border-b border-line pb-3 font-display text-xl">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href="/services"
          className="mt-10 inline-block text-sm font-semibold underline underline-offset-4"
        >
          See what's included →
        </Link>
      </section>

      {/* ---------- Video ---------- */}
      {featuredVideoId && (
        <section className="container-site pb-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Watch</p>
          <h2 className="mt-3 font-display text-display-md">A quick tutorial</h2>
          <div className="mt-8">
            <VideoFacade videoId={featuredVideoId} title="SH Photography tutorial" />
          </div>
        </section>
      )}

      {/* ---------- Contact CTA strip ---------- */}
      <section className="bg-ink text-paper">
        <div className="container-site flex flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-display-md">Let's make something.</h2>
            <p className="mt-3 max-w-md text-paper/70">{siteConfig.locationLine}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accentDark"
            >
              Book / Get in touch
            </Link>
            <SocialLinks />
          </div>
        </div>
      </section>
    </>
  );
}
