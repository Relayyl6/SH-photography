import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.positioningLine,
};

// Body copy reproduced verbatim from CONTENT.md Appendix 1 / client_spec.md
// Appendix 1 — do not edit, tighten or "improve" it (AGENTS.md §5 rule 8).
export default function AboutPage() {
  return (
    <>
      <div className="container-site pb-20 relative z-10 pt-10 md:pt-16">
        
        {/* Mobile Title (Stack) */}
        <div className="md:hidden flex flex-col mb-8 select-none font-display font-bold uppercase text-ink leading-[0.85] tracking-tighter w-full overflow-hidden">
          <div className="text-[22vw]">MY</div>
          <div className="text-[22vw]">STORY</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 lg:gap-20">
          
          {/* Left Column: Enlarged Picture (40%) & Sticky */}
          <div className="w-full md:w-[45%] lg:w-[40%] shrink-0 md:sticky md:top-[-8rem]">
            <div className="w-full">
              {/* "MY" stays sticky with the portrait */}
              <div className="hidden md:block w-full mb-6 select-none pointer-events-none">
                <svg viewBox="0 0 400 150" className="w-full h-auto text-ink fill-current overflow-visible">
                  <text x="0" y="110" textLength="340" lengthAdjust="spacingAndGlyphs" className="font-display font-bold uppercase tracking-tighter" fontSize="150">
                    MY
                  </text>
                </svg>
              </div>

              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-ink border border-line/40 group">
                <Image
                  src="/photos/personal/personal_01.jpg"
                  alt="Benedict Henry — SH Photography"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
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
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white border border-white/30">
                    Benedict Henry · Founder &amp; Lead Photographer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Headline & Article (Scrolls normally after initial freeze) */}
          <div className="w-full md:w-[55%] relative">
            <div className="w-full md:sticky md:top-[122px]">
            
            {/* "STORY" scrolls with the article, negative margin pulls it across the gap */}
            <div className="hidden md:block w-[calc(100%+3rem)] lg:w-[calc(100%+5rem)] -ml-12 lg:-ml-20 mb-6 select-none pointer-events-none">
              <svg viewBox="0 0 600 150" className="w-full h-auto text-ink fill-current overflow-visible">
                <text x="0" y="145" textLength="600" lengthAdjust="spacingAndGlyphs" className="font-display font-bold uppercase tracking-tighter" fontSize="210">
                  STORY
                </text>
              </svg>
            </div>

            {/* Headline Pushed to the Right */}
            <div className="text-left border-b border-line/40 pb-12 mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-5">Get to Know ME</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[4.5rem] leading-[1.05] text-ink tracking-tight drop-shadow-sm">
                Based in Manchester, United Kingdom.
              </h1>
            </div>

            {/* Article */}
            <article className="prose-none w-full space-y-8 text-[1.05rem] md:text-[1.15rem] leading-relaxed text-ink/80 lg:pl-12">
              <Reveal>
                <div>
                  <p className="font-display text-2xl md:text-3xl italic text-ink mb-1">A Bit About Me</p>
                  <p className="font-semibold text-ink uppercase tracking-widest text-xs">Benedict Henry | SH Photography</p>
                </div>
              </Reveal>

            <Reveal delay={0.1}>
              <p>
                Founded in 2020 in Benin City, Nigeria, SH Photography was born from a passion for
                preserving life&apos;s most beautiful moments. Today, based in Manchester, United
                Kingdom, I specialize in weddings, beauty portraits, events, retouching, and general
                photography services, helping clients relive their memories through striking, natural
                imagery.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p>
                My photography style is all about natural storytelling. I strive to capture moments
                that feel authentic and timeless, aiming for perfection even before post-production.
                Every shoot is an opportunity to tell a story from the smiles and laughter of a wedding
                day to the elegance of a beauty portrait.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <p>
                Photography started as a passion: I wanted to help people preserve memories, capture
                happiness, and create images that could last a lifetime. I approach every job with
                dedication, giving my very best to ensure client satisfaction is at the heart of
                everything I do. For me, it&apos;s never just about delivering a product it&apos;s
                about making the experience enjoyable, meaningful, and memorable for everyone involved.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <p>
                Every shoot with SH Photography is lively and engaging. I communicate openly with
                clients to understand their vision, ensuring they are comfortable and confident in
                front of the camera. Over the years, I&apos;ve had the privilege of covering countless
                events, winning retouching competitions, and developing a collection of professional
                gear to bring each project to life.
              </p>
            </Reveal>

            <Reveal delay={0.5}>
              <p>
                Above all, SH Photography is about relationships building trust with clients before,
                during, and after every shoot, and delivering images that capture the joy, beauty, and
                story of each unique moment
              </p>
            </Reveal>
          </article>
            </div>
            {/* Spacer to give the sticky element 250px of room to slide down */}
            <div className="hidden md:block h-[250px] w-full pointer-events-none"></div>
          </div>
      </div>
      </div>
    </>
  );
}
