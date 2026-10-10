import Link from "next/link";
import Image from "next/image";
import { siteConfig, featuredVideoId } from "@/lib/site-config";
import { sessions } from "@/lib/sessions";
import { SessionPreviewCarousel } from "@/components/SessionPreviewCarousel";
import { VideoFacade } from "@/components/VideoFacade";
import { SocialLinks } from "@/components/SocialLinks";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { Reveal } from "@/components/Reveal";

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-paper -mt-[120px]">
        
        {/* Blurred Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35] blur-sm pointer-events-none select-none z-0"
        >
          <source src="/photographer-bg.mp4" type="video/mp4" />
        </video>

        {/* Bottom Fade Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-paper to-transparent pointer-events-none z-0"></div>

        <div className="relative container-site flex min-h-[100vh] flex-col justify-center pt-[140px] pb-12 md:pt-[180px] md:pb-20 z-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent drop-shadow-sm">
            {siteConfig.location} · Est. 2020
          </p>

          <h1 className="mt-4 md:mt-6 font-display text-display-xl text-ink drop-shadow-sm">
            Photographing
            <br />
            <span className="italic text-accent">people,</span> brands
            <br />
            &amp; products
          </h1>

          <p className="mt-6 md:mt-8 max-w-xl text-base md:text-lg text-ink/80 drop-shadow-sm">{siteConfig.heroSubline}</p>

          <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
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
      <Reveal>
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
      </Reveal>

      {/* ---------- Services summary (Bento Grid) ---------- */}
      <Reveal>
        <section className="container-site py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">What I do</p>
              <h2 className="mt-3 font-display text-display-md">Services &amp; classes</h2>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
            >
              View packages &amp; pricing
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[300px]">
            
            {/* Block 1: Weddings & Anniversaries (Large Image) */}
            <Link href="/portfolio" className="group relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-[2rem] bg-ink block min-h-[400px] md:min-h-0">
               <Image src="/bento_wedding.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="Weddings" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
               <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col items-start">
                  <p className="text-white/70 font-sans text-xs tracking-widest uppercase font-bold mb-3 border border-white/30 rounded-full px-4 py-1 backdrop-blur-sm">Photography</p>
                  <h3 className="font-display text-4xl md:text-5xl text-white mb-2 leading-none tracking-tight">Weddings &amp; Anniversaries</h3>
                  <p className="text-white/80 text-sm md:text-base max-w-sm mt-2">Capturing your special day with elegance, preserving true emotions and timeless moments.</p>
               </div>
            </Link>

            {/* Block 2: Beauty Portraits (Vertical) */}
            <Link href="/portfolio" className="group relative col-span-1 md:col-span-1 md:row-span-2 overflow-hidden rounded-[2rem] bg-sand block min-h-[400px] md:min-h-0">
               <Image src="/bento_portrait.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="Portraits" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
               <div className="absolute bottom-8 left-6 right-6 z-10">
                  <p className="text-white/70 font-sans text-[10px] tracking-widest uppercase font-bold mb-2">Studio</p>
                  <h3 className="font-display text-3xl text-white leading-tight tracking-tight">Beauty<br/>Portraits</h3>
               </div>
            </Link>

            {/* Block 3: Events (Text / Solid Color) */}
            <Link href="/portfolio" className="group relative col-span-1 md:col-span-1 md:row-span-1 overflow-hidden rounded-[2rem] bg-accent p-8 flex flex-col justify-between block hover:bg-[#c93f16] transition-colors min-h-[250px] md:min-h-0">
               <div className="text-white/80 self-end bg-white/20 p-3 rounded-full backdrop-blur-md">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-90 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </div>
               <div>
                 <p className="text-white/80 font-sans text-[10px] tracking-widest uppercase font-bold mb-2">Photography</p>
                 <h3 className="font-display text-3xl text-white leading-tight tracking-tight">Events &amp;<br/>Graduations</h3>
               </div>
            </Link>

            {/* Block 4: Classes (Horizontal Image) */}
            <Link href="/services" className="group relative col-span-1 md:col-span-1 md:row-span-1 overflow-hidden rounded-[2rem] bg-ink block min-h-[250px] md:min-h-0">
               <Image src="/bento_classes.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70 group-hover:opacity-90" alt="Classes" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />
               <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <p className="text-white/70 font-sans text-[10px] tracking-widest uppercase font-bold mb-2">Education</p>
                  <h3 className="font-display text-2xl text-white leading-tight tracking-tight">Classes &amp;<br/>Retouching</h3>
               </div>
            </Link>

          </div>
        </section>
      </Reveal>

      {/* ---------- Video ---------- */}
      {featuredVideoId && (
        <Reveal>
          <section className="container-site pb-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Watch</p>
            <h2 className="mt-3 font-display text-display-md">A quick tutorial</h2>
            <div className="mt-8">
              <VideoFacade videoId={featuredVideoId} title="SH Photography tutorial" />
            </div>
          </section>
        </Reveal>
      )}

    </>
  );
}
