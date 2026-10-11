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
import { FloatingHeroCamera } from "@/components/FloatingHeroCamera";

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-paper -mt-[84px] md:-mt-[96px]">
        
        {/* Blurred Background Video with Poster Fallback */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          poster="/hero-bg.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35] blur-sm pointer-events-none select-none z-0"
        >
          <source src="/photographer-bg.mp4" type="video/mp4" />
        </video>

        {/* Bottom Fade Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-paper to-transparent pointer-events-none z-0"></div>

        <StaggerReveal className="relative container-site flex flex-col justify-center pt-[190px] pb-14 sm:pt-[205px] sm:pb-16 md:pt-[215px] md:pb-16 lg:pt-[230px] z-20" staggerVariant="fast">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 lg:gap-12">
            <div>
              <StaggerItem variant="fadeDown">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand/90 border border-line/60 backdrop-blur-sm mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {siteConfig.location} · Est. 2020
                  </p>
                </div>
              </StaggerItem>

              <h1 className="mt-2 font-display text-[3.25rem] xs:text-[3.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-display-xl text-ink drop-shadow-sm flex flex-col leading-[0.90] md:leading-[0.92] tracking-tight">
                <StaggerItem variant="fadeUpLarge">
                  <span>Photographing</span>
                </StaggerItem>
                <StaggerItem variant="fadeUpLarge">
                  <span><span className="italic text-accent">people,</span> brands</span>
                </StaggerItem>
                <StaggerItem variant="fadeUpLarge">
                  <span>&amp; products</span>
                </StaggerItem>
              </h1>

              <StaggerItem variant="fadeUp">
                <p className="mt-4 md:mt-6 max-w-xl text-base md:text-lg text-ink/80 drop-shadow-sm">
                  {siteConfig.heroSubline}
                </p>
              </StaggerItem>
            </div>

            <StaggerItem variant="fadeScale" className="shrink-0 pb-2">
              <div className="relative inline-flex items-center justify-center">
                <FloatingHeroCamera />
                <div className="relative z-10 flex flex-row items-center gap-3 sm:gap-4">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center justify-center rounded-full bg-ink px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-accent shadow-md"
                  >
                    View my work
                  </Link>
                  <Link
                    href="/book"
                    className="inline-flex items-center justify-center rounded-full border border-ink/40 px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-semibold bg-paper/80 backdrop-blur-md transition-colors hover:border-ink hover:bg-sand shadow-sm"
                  >
                    Book a shoot
                  </Link>
                </div>
              </div>
            </StaggerItem>
          </div>
        </StaggerReveal>

        {/* Real Staggered Editorial Photography Showcase - Visible above fold on mobile */}
        <StaggerReveal className="relative container-site grid grid-cols-2 gap-3 sm:gap-4 pb-16 md:pb-24 md:grid-cols-4 z-10 mt-10 sm:mt-12 md:mt-14" staggerVariant="slow">
          
          {/* 1. Weddings */}
          <StaggerItem variant="fadeUp">
            <Link href="/portfolio/weddings" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/bento_wedding.jpg" 
                alt="Weddings by SH Photography" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Weddings
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Authentic Love</p>
              </div>
            </Link>
          </StaggerItem>

          {/* 2. Portraits (Staggered on Desktop & Tablet) */}
          <StaggerItem variant="fadeDown" className="mt-4 sm:mt-6 md:mt-12">
            <Link href="/portfolio/portraits" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/bento_portrait.jpg" 
                alt="Portraits by SH Photography" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Portraits
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Warm Elegance</p>
              </div>
            </Link>
          </StaggerItem>

          {/* 3. Fine Art */}
          <StaggerItem variant="fadeUp">
            <Link href="/portfolio" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/frame-sq-1.jpg" 
                alt="Editorial Photography by SH Photography" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Editorial
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Regal Detail</p>
              </div>
            </Link>
          </StaggerItem>

          {/* 4. Education & Masterclasses (Staggered on Desktop & Tablet) */}
          <StaggerItem variant="fadeDown" className="mt-4 sm:mt-6 md:mt-12">
            <Link href="/services" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/bento_classes.jpg" 
                alt="Photography Masterclasses by SH Photography" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Classes
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Craft &amp; Light</p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerReveal>
      </section>

      {/* ---------- Giant Watermark Crosswalk ---------- */}
      <div className="w-full relative z-0 flex items-center justify-center select-none pointer-events-none">
        <h2 className="absolute w-full text-center font-display text-[11.5vw] leading-none text-ink/[0.06] blur-[3px] whitespace-nowrap m-0 p-0 tracking-tighter">
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-xl border border-line/60 group bg-ink">
              <Image
                src="/frame-circle.jpg"
                alt="Benedict Henry — SH Photography"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-semibold uppercase tracking-widest text-white border border-white/30 mb-2">
                  Founder &amp; Principal
                </span>
                <p className="font-display text-2xl font-bold">Benedict Henry</p>
                <p className="text-xs text-white/80 mt-0.5">Manchester, United Kingdom</p>
              </div>
            </div>
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

          <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:auto-rows-[220px]">
            
            {/* 1. Weddings (2 cols wide on mobile/tab, 2x2 on desktop) */}
            <StaggerItem className="col-span-2 md:col-span-2 md:row-span-2" variant="fadeUpLarge">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink flex flex-col justify-end p-5 sm:p-8 min-h-[260px] sm:min-h-[320px] md:min-h-0 h-full w-full block">
                 <Image src="/bento_wedding.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="Weddings" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-white/70 font-sans text-[10px] sm:text-xs tracking-widest uppercase font-bold mb-2 sm:mb-3 border border-white/30 rounded-full px-3 sm:px-4 py-0.5 sm:py-1 inline-block backdrop-blur-sm">Photography</p>
                    <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-none tracking-tight">Weddings</h3>
                 </div>
              </Link>
            </StaggerItem>

            {/* 2. General Photography (tall 1 col, 2 rows on mobile & desktop) */}
            <StaggerItem className="col-span-1 row-span-2 md:col-span-1 md:row-span-2" variant="fadeUpLarge">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink flex flex-col justify-end p-4 sm:p-6 min-h-[320px] sm:min-h-[360px] md:min-h-0 h-full w-full block">
                 <Image src="/bento_portrait.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt="General Photography" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-white/70 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-1 sm:mb-2">Portfolio</p>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-white leading-tight tracking-tight">General<br/>Photography</h3>
                 </div>
              </Link>
            </StaggerItem>

            {/* 3. Birthdays (1x1 square next to General Photography) */}
            <StaggerItem className="col-span-1 row-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-sand p-4 sm:p-5 md:p-6 flex flex-col justify-between hover:bg-[#e8e4db] transition-colors min-h-[155px] sm:min-h-[175px] md:min-h-0 h-full w-full block">
                 <div className="text-ink/30 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 absolute top-4 right-4 sm:top-6 sm:right-6">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                   <p className="text-ink/50 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-0.5 sm:mb-1">Photography</p>
                   <h3 className="font-display text-lg sm:text-xl md:text-2xl text-ink leading-tight tracking-tight">Birthdays</h3>
                   <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-ink/70 leading-snug sm:leading-relaxed line-clamp-2 md:line-clamp-none">Vibrant, authentic portrait sessions to celebrate another year.</p>
                 </div>
              </Link>
            </StaggerItem>

            {/* 4. Anniversaries (1x1 square under Birthdays, next to General Photography) */}
            <StaggerItem className="col-span-1 row-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-paper border border-line/50 p-4 sm:p-5 md:p-6 flex flex-col justify-between hover:border-line transition-colors min-h-[155px] sm:min-h-[175px] md:min-h-0 h-full w-full block">
                 <div className="text-ink/30 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 absolute top-4 right-4 sm:top-6 sm:right-6">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                   <p className="text-ink/50 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-0.5 sm:mb-1">Photography</p>
                   <h3 className="font-display text-lg sm:text-xl md:text-2xl text-ink leading-tight tracking-tight">Anniversaries</h3>
                   <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-ink/70 leading-snug sm:leading-relaxed line-clamp-2 md:line-clamp-none">Intimate, storytelling couples photography to honor your journey.</p>
                 </div>
              </Link>
            </StaggerItem>

            {/* 5. Gen Photo Classes (2 cols wide on mobile/tab, 2x1 on desktop) */}
            <StaggerItem className="col-span-2 md:col-span-2 md:row-span-1" variant="fadeUpLarge">
              <Link href="/services" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink flex flex-col justify-end p-5 sm:p-6 min-h-[170px] sm:min-h-[200px] md:min-h-0 h-full w-full block">
                 <Image src="/bento_classes.jpg" fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-70 group-hover:opacity-90" alt="Classes" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                 <div className="relative z-10">
                    <p className="text-white/70 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-1">Education</p>
                    <h3 className="font-display text-2xl sm:text-3xl text-white leading-tight tracking-tight">Photography Classes</h3>
                 </div>
              </Link>
            </StaggerItem>

            {/* 6. Graduations (1x1 square) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/portfolio" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-accent p-4 sm:p-5 md:p-6 flex flex-col justify-between hover:bg-[#c93f16] transition-colors min-h-[155px] sm:min-h-[175px] md:min-h-0 h-full w-full block">
                 <div className="text-white/80 self-end bg-white/20 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 absolute top-4 right-4 sm:top-6 sm:right-6">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white opacity-90 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                    <p className="text-white/80 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-0.5 sm:mb-1">Photography</p>
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl text-white leading-tight tracking-tight">Graduations</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/80 leading-snug sm:leading-relaxed line-clamp-2 md:line-clamp-none">Mark your achievements with timeless graduation portraits.</p>
                 </div>
              </Link>
            </StaggerItem>

            {/* 7. Retouching Classes (1x1 square) */}
            <StaggerItem className="col-span-1 md:col-span-1 md:row-span-1" variant="fadeScale">
              <Link href="/services" className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink p-4 sm:p-5 md:p-6 flex flex-col justify-between hover:bg-[#222] transition-colors min-h-[155px] sm:min-h-[175px] md:min-h-0 h-full w-full block">
                 <div className="text-white/30 self-end transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 absolute top-4 right-4 sm:top-6 sm:right-6">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div className="mt-auto">
                    <p className="text-white/50 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-0.5 sm:mb-1">Education</p>
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl text-white leading-tight tracking-tight">Retouching<br/>Classes</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/60 leading-snug sm:leading-relaxed line-clamp-2 md:line-clamp-none">Master editing to elevate raw images to editorial quality.</p>
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
