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
        
        {/* Background Video with Poster Fallback (Desktop/Tablet only) */}
        <video
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="metadata"
          poster="/hero-bg.jpg"
          className="hidden md:block absolute inset-0 h-full w-full object-cover opacity-[0.25] pointer-events-none select-none z-0 transform-gpu"
        >
          <source src="/photographer-bg.mp4" type="video/mp4" />
        </video>

        {/* Lightweight Mobile Static Background (Fast & Smooth 60fps on phones) */}
        <div 
          className="md:hidden absolute inset-0 bg-cover bg-center opacity-[0.18] pointer-events-none z-0" 
          style={{ backgroundImage: "url('/hero-bg.jpg')" }} 
        />

        {/* Bottom Fade Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-paper to-transparent pointer-events-none z-0"></div>

        <StaggerReveal className="relative container-site flex flex-col justify-center pt-[190px] pb-8 sm:pt-[205px] sm:pb-12 md:pt-[215px] md:pb-14 lg:pt-[230px] z-10" staggerVariant="fast">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
            <div>
              <StaggerItem variant="fadeDown">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-sand/90 border border-line/60 backdrop-blur-sm mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                    {siteConfig.location} · Est. 2020
                  </p>
                </div>
              </StaggerItem>

              <h1 className="mt-3 font-display text-[3.5rem] xs:text-[4rem] sm:text-[5.25rem] md:text-[6.25rem] lg:text-[7.25rem] xl:text-[8.5rem] 2xl:text-[9.5rem] text-ink drop-shadow-sm flex flex-col leading-[0.88] sm:leading-[0.92] md:leading-[0.92] lg:leading-[0.92] xl:leading-[0.92] tracking-[-0.035em] sm:tracking-[-0.02em] md:tracking-[-0.015em] lg:tracking-[-0.015em]">
                <StaggerItem variant="fadeUpLarge">
                  <span className="font-medium">Photographing</span>
                </StaggerItem>
                <StaggerItem variant="fadeUpLarge">
                  <span className="font-medium">
                    <span className="italic font-normal text-accent pr-1.5">People,</span> brands
                  </span>
                </StaggerItem>
                <StaggerItem variant="fadeUpLarge">
                  <span className="font-medium">&amp; products</span>
                </StaggerItem>
              </h1>

              <StaggerItem variant="fadeUp">
                <p className="mt-4 md:mt-6 max-w-xl text-base sm:text-lg md:text-xl lg:text-2xl text-ink/80 drop-shadow-sm">
                  {siteConfig.heroSubline}
                </p>
              </StaggerItem>
            </div>

            <StaggerItem variant="fadeScale" className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-end pb-2 mt-8 sm:mt-10 lg:mt-0 lg:pb-3 lg:pr-6 xl:pr-10 2xl:pr-14">
              <div className="relative inline-flex items-center justify-center max-w-full">
                <FloatingHeroCamera />
                <div className="relative z-10 flex flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-full">
                  <Link
                    href="/portfolio"
                    className="group/btn relative inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold tracking-wide text-paper shadow-[0_8px_25px_rgba(21,19,15,0.3)] ring-1 ring-white/15 transition-all duration-300 hover:bg-accent hover:shadow-[0_10px_30px_rgba(232,73,28,0.4)] hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>View my work</span>
                    <span className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:bg-white/25">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </Link>

                  <Link
                    href="/book"
                    className="group/btn2 relative inline-flex items-center justify-center gap-2 rounded-full border border-ink/30 bg-paper/85 px-5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold tracking-wide text-ink backdrop-blur-xl shadow-[0_4px_20px_rgba(21,19,15,0.08)] ring-1 ring-black/5 transition-all duration-300 hover:border-ink hover:bg-sand hover:shadow-[0_8px_25px_rgba(21,19,15,0.16)] hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>Book a shoot</span>
                    <span className="flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-ink/5 transition-all duration-300 group-hover/btn2:bg-accent/15 group-hover/btn2:rotate-12">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-ink transition-colors duration-300 group-hover/btn2:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 7.5h18M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </StaggerItem>
          </div>
        </StaggerReveal>

        {/* Real Staggered Editorial Photography Showcase - Real Client Work with Archive Badges */}
        <StaggerReveal className="relative container-site grid grid-cols-2 gap-3 sm:gap-4 pb-16 md:pb-24 md:grid-cols-4 z-20 mt-32 sm:mt-8 md:mt-12" staggerVariant="slow">
          
          {/* 1. Weddings */}
          <StaggerItem variant="fadeUp">
            <Link href="/portfolio/weddings" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/photos/weddings/weddings_01.jpg" 
                alt="Weddings by SH Photography" 
                fill 
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
              
              {/* Corner crop marks */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none z-10" />

              <div className="absolute top-3 right-3 z-10">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-paper/70 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  SH Archive
                </span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 z-10">
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
                src="/photos/portraits/portraits_01.jpg" 
                alt="Portraits by SH Photography" 
                fill 
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
              
              {/* Corner crop marks */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none z-10" />

              <div className="absolute top-3 right-3 z-10">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-paper/70 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  SH Archive
                </span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 z-10">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Portraits
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Warm Elegance</p>
              </div>
            </Link>
          </StaggerItem>

          {/* 3. Events */}
          <StaggerItem variant="fadeUp">
            <Link href="/portfolio/events" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/photos/events/events_01.jpg" 
                alt="Events Photography by SH Photography" 
                fill 
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
              
              {/* Corner crop marks */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none z-10" />

              <div className="absolute top-3 right-3 z-10">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-paper/70 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  SH Archive
                </span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 z-10">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Events
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Live Atmosphere</p>
              </div>
            </Link>
          </StaggerItem>

          {/* 4. Sports & Athletics (Staggered on Desktop & Tablet) */}
          <StaggerItem variant="fadeDown" className="mt-4 sm:mt-6 md:mt-12">
            <Link href="/portfolio/sports" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink shadow-lg border border-line/40">
              <Image 
                src="/photos/sports/sports_01.jpg" 
                alt="Sports Photography by SH Photography" 
                fill 
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
              
              {/* Corner crop marks */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none z-10" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none z-10" />

              <div className="absolute top-3 right-3 z-10">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-paper/70 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  SH Archive
                </span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 z-10">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-white border border-white/30 mb-1 sm:mb-2">
                  Sports
                </span>
                <p className="font-display text-base sm:text-2xl text-white font-medium leading-tight">Decisive Action</p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerReveal>
      </section>

      {/* ---------- Giant Watermark Crosswalk ---------- */}
      <div className="w-full relative z-0 flex items-center justify-center select-none pointer-events-none">
        <h2 className="absolute w-full text-center font-display text-[11.5vw] leading-none text-ink/[0.04] whitespace-nowrap m-0 p-0 tracking-tighter">
          SH PHOTOGRAPHY
        </h2>
      </div>

      {/* ---------- Sessions ---------- */}
      <section className="container-site py-24 relative z-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Sessions</p>
            <h2 className="mt-3 font-display text-display-md">How I tell your story</h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold underline underline-offset-4">
            See the full portfolio →
          </Link>
        </div>

        <StaggerReveal className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.slice(0, 3).map((session) => (
            <StaggerItem key={session.slug} variant="fadeUp">
              <Link href={`/portfolio/${session.slug}`} className="group block">
                <SessionPreviewCarousel
                  sessionSlug={session.slug}
                  sessionTitle={session.title}
                  count={session.previewCount}
                />
                <h3 className="mt-4 font-display text-2xl group-hover:text-accent">{session.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{session.intro}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerReveal>

        <div className="mt-12 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-full border border-ink/30 px-8 py-3.5 text-sm font-semibold text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper shadow-sm"
          >
            Explore all {sessions.length} sessions in full portfolio →
          </Link>
        </div>
      </section>

      {/* ---------- About teaser ---------- */}
      <Reveal>
        <section className="border-y border-line bg-sand">
          <div className="container-site grid gap-12 py-24 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-xl border border-line/60 group bg-ink">
              <Image
                src="/photos/personal/personal_06.jpg"
                alt="Benedict Henry — Founder & Principal, SH Photography"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Corner edge marks */}
              <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/60 pointer-events-none z-10" />
              <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/60 pointer-events-none z-10" />
              <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/60 pointer-events-none z-10" />
              <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/60 pointer-events-none z-10" />
              
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-accent/90 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                  SH Archive
                </span>
                <span className="text-[9px] uppercase tracking-widest text-paper/70 font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  MCR · UK
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
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
            {[
              {
                slug: "weddings",
                title: "Weddings",
                badge: "Photography",
                span: "col-span-2 md:col-span-2 md:row-span-2",
                minH: "min-h-[260px] sm:min-h-[320px] md:min-h-0",
                image: "/photos/weddings/weddings_02.jpg",
                titleSize: "text-3xl sm:text-4xl md:text-5xl",
                desc: "Cinematic, documentary wedding storytelling capturing raw emotion and quiet romance.",
              },
              {
                slug: "portraits",
                title: "Beauty &\nPortraits",
                badge: "Portraits",
                span: "col-span-1 row-span-2 md:col-span-1 md:row-span-2",
                minH: "min-h-[320px] sm:min-h-[360px] md:min-h-0",
                image: "/photos/portraits/portraits_02.jpg",
                titleSize: "text-2xl sm:text-3xl",
              },
              {
                slug: "family",
                title: "Family",
                badge: "Warmth",
                span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
                minH: "min-h-[155px] sm:min-h-[175px] md:min-h-0",
                image: "/photos/family/family_01.jpg",
                titleSize: "text-lg sm:text-xl md:text-2xl",
              },
              {
                slug: "events",
                title: "Events",
                badge: "Atmosphere",
                span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
                minH: "min-h-[155px] sm:min-h-[175px] md:min-h-0",
                image: "/photos/events/events_01.jpg",
                titleSize: "text-lg sm:text-xl md:text-2xl",
              },
              {
                slug: "behind-the-scenes",
                title: "Behind the Scenes",
                badge: "On Set",
                span: "col-span-2 md:col-span-2 md:row-span-1",
                minH: "min-h-[170px] sm:min-h-[200px] md:min-h-0",
                image: "/photos/behind-the-scenes/behind-the-scenes_01.jpg",
                titleSize: "text-2xl sm:text-3xl",
              },
              {
                slug: "birthdays",
                title: "Birthdays",
                badge: "Celebration",
                span: "col-span-1 md:col-span-1 md:row-span-1",
                minH: "min-h-[155px] sm:min-h-[175px] md:min-h-0",
                image: "/photos/birthday/birthday_01.jpg",
                titleSize: "text-lg sm:text-xl md:text-2xl",
              },
              {
                slug: "personal",
                title: "Personal Branding",
                badge: "Identity",
                span: "col-span-1 md:col-span-1 md:row-span-1",
                minH: "min-h-[155px] sm:min-h-[175px] md:min-h-0",
                image: "/photos/personal/personal_01.jpg",
                titleSize: "text-lg sm:text-xl md:text-2xl",
              },
              {
                slug: "sports",
                title: "Sports & Athletics",
                badge: "Action",
                span: "col-span-2 md:col-span-2 md:row-span-1",
                minH: "min-h-[170px] sm:min-h-[200px] md:min-h-0",
                image: "/photos/sports/sports_01.jpg",
                titleSize: "text-2xl sm:text-3xl",
              },
              {
                slug: "general-photography-classes",
                title: "Photography & Retouching Classes",
                badge: "Education · Online & In-Person",
                span: "col-span-2 md:col-span-2 md:row-span-1",
                minH: "min-h-[170px] sm:min-h-[200px] md:min-h-0",
                image: "/photos/behind-the-scenes/behind-the-scenes_05.jpg",
                titleSize: "text-2xl sm:text-3xl",
              },
            ].map((card) => (
              <StaggerItem key={card.slug} className={card.span} variant="fadeUpLarge">
                <Link
                  href={`/services/${card.slug}`}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-ink flex flex-col justify-end p-4 sm:p-6 ${card.minH} h-full w-full block`}
                >
                  <Image
                    src={card.image}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                    alt={`${card.title.replace('\n', ' ')} by SH Photography`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/60 pointer-events-none z-10" />
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/60 pointer-events-none z-10" />
                  <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/60 pointer-events-none z-10" />
                  <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/60 pointer-events-none z-10" />
                  <div className="relative z-10">
                    <p className="text-white/70 font-sans text-[9px] sm:text-[10px] tracking-widest uppercase font-bold mb-1 border border-white/20 rounded-full px-2.5 py-0.5 inline-block backdrop-blur-sm">
                      {card.badge}
                    </p>
                    <h3 className={`font-display ${card.titleSize} text-white leading-tight tracking-tight whitespace-pre-line`}>
                      {card.title}
                    </h3>
                    {card.desc && (
                      <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-sm hidden sm:block">
                        {card.desc}
                      </p>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>
      </Reveal>

      {/* ---------- Video ---------- */}
      {featuredVideoId && (
        <Reveal>
          <section className="container-site pb-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Behind the Lens</p>
            <h2 className="mt-3 font-display text-display-md">How the MAGIC happens, a walkthrough of my work</h2>
            <div className="mt-8">
              <VideoFacade videoId={featuredVideoId} title="Photoshoot behind the scenes" />
            </div>
          </section>
        </Reveal>
      )}

    </>
  );
}
