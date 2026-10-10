import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { PlaceholderImage } from "@/components/PlaceholderImage";

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
        
        {/* Unified Title matching the grid layout EXACTLY */}
        <div className="hidden md:flex flex-row items-end justify-between gap-12 lg:gap-20 mb-6 select-none pointer-events-none">
          {/* Left Side: "MY" strictly matching the 40% column */}
          <div className="w-full md:w-[45%] lg:w-[40%] shrink-0">
            <svg viewBox="0 0 160 100" className="w-full h-auto text-ink fill-current overflow-hidden">
              <text x="0" y="85" textLength="160" lengthAdjust="spacing" className="font-display font-bold uppercase" fontSize="100">
                MY
              </text>
            </svg>
          </div>
          {/* Right Side: "STORY" strictly matching the 55% column */}
          <div className="w-full md:w-[55%]">
            <svg viewBox="0 0 350 100" className="w-full h-auto text-ink fill-current overflow-hidden">
              <text x="0" y="85" textLength="350" lengthAdjust="spacing" className="font-display font-bold uppercase" fontSize="100">
                STORY
              </text>
            </svg>
          </div>
        </div>

        {/* Mobile Title (Perfectly Justified Stack) */}
        <div className="md:hidden flex flex-col mb-8 select-none pointer-events-none">
          <svg viewBox="0 0 350 200" className="w-full h-auto text-ink fill-current overflow-hidden">
            <text x="0" y="90" textLength="350" lengthAdjust="spacing" className="font-display font-bold uppercase" fontSize="100">MY</text>
            <text x="0" y="190" textLength="350" lengthAdjust="spacing" className="font-display font-bold uppercase" fontSize="100">STORY</text>
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 lg:gap-20">
          
          {/* Left Column: Enlarged Picture (40%) & Sticky */}
          <div className="w-full md:w-[45%] lg:w-[40%] shrink-0 md:sticky md:top-32">
            <div className="w-full">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
                <PlaceholderImage label="Benedict Henry" ratio="4 / 5" />
              </div>
            </div>
          </div>

          {/* Right Column: Headline & Article */}
          <div className="w-full md:w-[55%]">
            
            {/* Headline Pushed to the Right */}
            <div className="text-left border-b border-line/40 pb-12 mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-5">Get to Know ME</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[4.5rem] leading-[1.05] text-ink tracking-tight drop-shadow-sm">
                Based in Manchester, United Kingdom.
              </h1>
            </div>

            {/* Article */}
            <article className="prose-none w-full space-y-8 text-[1.05rem] md:text-[1.15rem] leading-relaxed text-ink/80 lg:pl-12">
              <div>
                <p className="font-display text-2xl md:text-3xl italic text-ink mb-1">A Bit About Me</p>
                <p className="font-semibold text-ink uppercase tracking-widest text-xs">Benedict Henry | SH Photography</p>
              </div>

            <p>
              Founded in 2020 in Benin City, Nigeria, SH Photography was born from a passion for
              preserving life&apos;s most beautiful moments. Today, based in Manchester, United
              Kingdom, I specialize in weddings, beauty portraits, events, retouching, and general
              photography services, helping clients relive their memories through striking, natural
              imagery.
            </p>

            <p>
              My photography style is all about natural storytelling. I strive to capture moments
              that feel authentic and timeless, aiming for perfection even before post-production.
              Every shoot is an opportunity to tell a story from the smiles and laughter of a wedding
              day to the elegance of a beauty portrait.
            </p>

            <p>
              Photography started as a passion: I wanted to help people preserve memories, capture
              happiness, and create images that could last a lifetime. I approach every job with
              dedication, giving my very best to ensure client satisfaction is at the heart of
              everything I do. For me, it&apos;s never just about delivering a product it&apos;s
              about making the experience enjoyable, meaningful, and memorable for everyone involved.
            </p>

            <p>
              Every shoot with SH Photography is lively and engaging. I communicate openly with
              clients to understand their vision, ensuring they are comfortable and confident in
              front of the camera. Over the years, I&apos;ve had the privilege of covering countless
              events, winning retouching competitions, and developing a collection of professional
              gear to bring each project to life.
            </p>

            <p>
              Above all, SH Photography is about relationships building trust with clients before,
              during, and after every shoot, and delivering images that capture the joy, beauty, and
              story of each unique moment
            </p>
          </article>
        </div>
      </div>
      </div>
    </>
  );
}
