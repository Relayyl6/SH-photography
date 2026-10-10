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
      <div className="w-full overflow-hidden select-none pointer-events-none mt-10 mb-6 md:mb-10">
        <svg viewBox="0 0 1000 250" className="w-full h-auto text-ink fill-current overflow-visible">
          <text 
            x="50%" 
            y="220" 
            textAnchor="middle" 
            className="font-display font-bold uppercase tracking-tighter" 
          >
            <tspan fontSize="120" dy="-100">ST</tspan>
            <tspan fontSize="280" dy="100">ORY</tspan>
          </text>
        </svg>
      </div>

      <div className="container-site pb-20">
        
        {/* Top Header Block: Small Picture (Left) | Headline (Right) */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mt-8 md:mt-12">
          
          {/* Left Column: Picture (Up Small) & Contact */}
          <div className="w-full md:w-[260px] lg:w-[300px] shrink-0 md:sticky md:top-32">
            <div className="w-48 md:w-full mx-auto md:mx-0">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-xl ring-1 ring-ink/5">
                <PlaceholderImage label="Benedict Henry" ratio="4 / 5" />
              </div>
            </div>
            
            <dl className="mt-8 space-y-5 text-sm text-center md:text-left">
              <div>
                <dt className="text-ink/40 uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Contact</dt>
                <dd>
                  <a href={`tel:${siteConfig.phoneE164}`} className="underline underline-offset-4 text-base font-medium hover:text-accent transition-colors">
                    {siteConfig.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink/40 uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.email}`} className="underline underline-offset-4 break-all text-base font-medium hover:text-accent transition-colors">
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink/40 uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Location</dt>
                <dd className="text-base font-medium">{siteConfig.locationLine}</dd>
              </div>
            </dl>
            
            <div className="mt-10 flex justify-center md:justify-start">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-paper hover:bg-accent transition-all duration-300"
              >
                Book / Get in touch
              </a>
            </div>
          </div>

          {/* Right Column: Headline & Article */}
          <div className="w-full md:max-w-2xl lg:max-w-4xl md:pl-10">
            
            {/* Headline Pushed to the Right */}
            <div className="text-left md:text-right ml-auto md:max-w-3xl border-b border-line/40 pb-12 mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-5">Get to Know ME</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[4rem] leading-[1.05] text-ink tracking-tight drop-shadow-sm">
                Based in Manchester, United Kingdom. Photographing people, brands and products since 2020.
              </h1>
            </div>

            {/* Article */}
            <article className="prose-none w-full space-y-8 text-[1.05rem] md:text-[1.15rem] leading-relaxed text-ink/80 md:pl-12 lg:pl-24">
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
    </>
  );
}
