import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { Reveal } from "@/components/Reveal";
import { getAboutPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.positioningLine,
};

export default async function AboutPage() {
  const about = await getAboutPageContent();
  const rawBody = about.body || "";
  const paragraphs = rawBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

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
                  src={about.coverImage.url || "/photos/personal/personal_01.jpg"}
                  alt={about.coverImage.alt || `${about.signature} — SH Photography`}
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
                    {about.signature || "Benedict Henry"} · Founder &amp; Lead Photographer
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
                {about.heading || "Based in Manchester, United Kingdom."}
              </h1>
            </div>

            {/* Article */}
            <article className="prose-none w-full space-y-8 text-[1.05rem] md:text-[1.15rem] leading-relaxed text-ink/80 lg:pl-12">
              <Reveal>
                <div>
                  <p className="font-display text-2xl md:text-3xl italic text-ink mb-1">A Bit About Me</p>
                  <p className="font-semibold text-ink uppercase tracking-widest text-xs">{about.signature || "Benedict Henry"} | SH Photography</p>
                </div>
              </Reveal>

              {paragraphs.map((para, idx) => (
                <Reveal key={idx} delay={0.1 * (idx + 1)}>
                  <p>{para}</p>
                </Reveal>
              ))}

              {/* Studio Highlights (Figures) rendered on the public page */}
              {about.stats && about.stats.length > 0 && (
                <div className="pt-8 mt-12 border-t border-line/50">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-6">Studio Highlights</p>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {about.stats.map((st, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-sand/40 border border-line/70 flex flex-col justify-between hover:border-ink/40 transition-colors"
                      >
                        <p className="text-2xl sm:text-3xl font-display font-bold text-ink">{st.value}</p>
                        <p className="text-xs text-ink/70 font-medium mt-1">{st.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
