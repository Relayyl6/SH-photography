import Link from "next/link";
import Image from "next/image";
import { siteConfig, featuredVideoId } from "@/lib/site-config";
import { sessions } from "@/lib/sessions";
import { SessionPreviewCarousel } from "@/components/SessionPreviewCarousel";
import { VideoFacade } from "@/components/VideoFacade";
import { SocialLinks } from "@/components/SocialLinks";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { Reveal } from "@/components/Reveal";
import { StaggerReveal, StaggerItem } from "@/components/StaggerReveal";

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

        <StaggerReveal className="relative container-site flex min-h-[100vh] flex-col justify-center pt-[140px] pb-12 md:pt-[180px] md:pb-20 z-10" staggerVariant="fast">
          <StaggerItem variant="fadeDown">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent drop-shadow-sm">
              {siteConfig.location} · Est. 2020
            </p>
          </StaggerItem>

          <StaggerItem variant="fadeUpLarge">
            <h1 className="mt-4 md:mt-6 font-display text-display-xl text-ink drop-shadow-sm">
              Photographing
              <br />
              <span className="italic text-accent">people,</span> brands
              <br />
              &amp; products
            </h1>
          </StaggerItem>

          <StaggerItem variant="fadeUp">
            <p className="mt-6 md:mt-8 max-w-xl text-base md:text-lg text-ink/80 drop-shadow-sm">{siteConfig.heroSubline}</p>
          </StaggerItem>

          <StaggerItem variant="fadeScale">
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
          </StaggerItem>
        </StaggerReveal>

        <StaggerReveal className="relative container-site grid grid-cols-2 gap-4 pb-16 md:grid-cols-4 z-10" staggerVariant="slow">
          <StaggerItem variant="fadeUp"><PlaceholderImage label="Hero image 1" ratio="3 / 4" /></StaggerItem>
          <StaggerItem variant="fadeDown" className="mt-8"><PlaceholderImage label="Hero image 2" ratio="3 / 4" /></StaggerItem>
          <StaggerItem variant="fadeUp"><PlaceholderImage label="Hero image 3" ratio="3 / 4" /></StaggerItem>
          <StaggerItem variant="fadeDown" className="mt-8"><PlaceholderImage label="Hero image 4" ratio="3 / 4" /></StaggerItem>
        </StaggerReveal>
      </section>

      {/* ---------- Giant Watermark Crosswalk ---------- */}
      <div className="w-full relative z-0 flex items-center justify-center select-none pointer-events-none">
        <h2 className="absolute w-full text-center font-display text-[10vw] leading-none text-ink/[0.06] blur-[3px] whitespace-nowrap m-0 p-0 tracking-tighter">
          SH PHOTOGRAPHY
        </h2>
      </div>

      {/* ---------- Sessions ---------- */}
      <section className="container-site py-24 relative z-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Sessions</p>
            <h2 className="mt-3 font-display text-display-md">Five ways I tell your story</h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold underline underline-offset-4">
            See the full portfolio →
          </Link>
        </div>

        <StaggerReveal className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <StaggerItem key={session.slug} variant="fadeUp">
              <Link href={`/portfolio/${session.slug}`} className="group block">
                <SessionPreviewCarousel sessionTitle={session.title} count={session.previewCount} />
                <h3 className="mt-4 font-display text-2xl group-hover:text-accent">{session.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{session.intro}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerReveal>
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
        <section className="container-site pt-24 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">What I do</p>
              <h2 className="mt-3 font-display text-display-md">Services &amp; classes</h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-full border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper"
            >
              View packages &amp; pricing
            </Link>
          </div>

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[220px]">
            
            {/* 1. Weddings (2x2) */}
            <StaggerItem className="col-span-1 md:col-span-2 md:row-span-2" variant="fadeUpLarge">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-[2rem] bg-ink flex flex-col justify-end p-8 min-h-[350px] md:min-h-0 h-full w-full block">
                 <Image src="/bento_wedding.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="Weddings" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-white/70 font-sans text-xs tracking-widest uppercase font-bold mb-3 border border-white/30 rounded-full px-4 py-1 inline-block backdrop-blur-sm">Photography</p>
                    <h3 className="font-display text-4xl md:text-5xl text-white leading-none tracking-tight">Weddings</h3>
                 </div>
              </Link>
            </StaggerItem>

            {/* 2. General Photography (1x2) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-2" variant="fadeUpLarge">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-[2rem] bg-ink flex flex-col justify-end p-6 min-h-[350px] md:min-h-0 h-full w-full block">
                 <Image src="/bento_portrait.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="General Photography" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-white/70 font-sans text-[10px] tracking-widest uppercase font-bold mb-2">Portfolio</p>
                    <h3 className="font-display text-3xl text-white leading-tight tracking-tight">General<br/>Photography</h3>
                 </div>
              </Link>
            </StaggerItem>

            {/* 3. Birthdays (1x1) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-[2rem] bg-sand p-6 flex flex-col justify-between hover:bg-[#e8e4db] transition-colors min-h-[220px] md:min-h-0 h-full w-full block">
                 <div className="text-ink/30 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 absolute top-6 right-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                   <p className="text-ink/50 font-sans text-[10px] tracking-widest uppercase font-bold mb-1">Photography</p>
                   <h3 className="font-display text-2xl text-ink leading-tight tracking-tight">Birthdays</h3>
                   <p className="mt-2 text-sm text-ink/70 leading-relaxed">Vibrant, authentic portrait sessions to celebrate and preserve another year of your life.</p>
                 </div>
              </Link>
            </StaggerItem>

            {/* 4. Anniversaries (1x1) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-[2rem] bg-paper border border-line/50 p-6 flex flex-col justify-between hover:border-line transition-colors min-h-[220px] md:min-h-0 h-full w-full block">
                 <div className="text-ink/30 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 absolute top-6 right-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                   <p className="text-ink/50 font-sans text-[10px] tracking-widest uppercase font-bold mb-1">Photography</p>
                   <h3 className="font-display text-2xl text-ink leading-tight tracking-tight">Anniversaries</h3>
                   <p className="mt-2 text-sm text-ink/70 leading-relaxed">Intimate, storytelling couples photography to honor and celebrate your journey together.</p>
                 </div>
              </Link>
            </StaggerItem>

            {/* 5. Gen Photo Classes (2x1) */}
            <StaggerItem className="col-span-1 md:col-span-2 md:row-span-1" variant="fadeUpLarge">
              <Link href="/services" className="group relative overflow-hidden rounded-[2rem] bg-ink flex flex-col justify-end p-6 min-h-[220px] md:min-h-0 h-full w-full block">
                 <Image src="/bento_classes.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70 group-hover:opacity-90" alt="Classes" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-white/70 font-sans text-[10px] tracking-widest uppercase font-bold mb-1">Education</p>
                    <h3 className="font-display text-3xl text-white leading-tight tracking-tight">Photography Classes</h3>
                 </div>
              </Link>
            </StaggerItem>

            {/* 6. Graduations (1x1) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-[2rem] bg-accent p-6 flex flex-col justify-between hover:bg-[#c93f16] transition-colors min-h-[220px] md:min-h-0 h-full w-full block">
                 <div className="text-white/80 self-end bg-white/20 p-2 rounded-full backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 absolute top-6 right-6">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-90 group-hover:opacity-100"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                   <p className="text-white/80 font-sans text-[10px] tracking-widest uppercase font-bold mb-1">Photography</p>
                   <h3 className="font-display text-2xl text-white leading-tight tracking-tight">Graduations</h3>
                   <p className="mt-2 text-sm text-white/80 leading-relaxed">Mark your academic achievements with elegant, timeless graduation portraits.</p>
                 </div>
              </Link>
            </StaggerItem>

            {/* 7. Retouching Classes (1x1) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/services" className="group relative overflow-hidden rounded-[2rem] bg-ink p-6 flex flex-col justify-between hover:bg-[#222] transition-colors min-h-[220px] md:min-h-0 h-full w-full block">
                 <div className="text-white/30 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 absolute top-6 right-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                   <p className="text-white/50 font-sans text-[10px] tracking-widest uppercase font-bold mb-1">Education</p>
                   <h3 className="font-display text-2xl text-white leading-tight tracking-tight">Retouching<br/>Classes</h3>
                   <p className="mt-2 text-sm text-white/60 leading-relaxed">Master professional editing techniques to elevate your raw images to editorial quality.</p>
                 </div>
              </Link>
            </StaggerItem>

          </StaggerReveal>
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
