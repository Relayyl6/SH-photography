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
      <div className="w-full overflow-hidden select-none pointer-events-none mt-10 mb-10">
        <svg viewBox="0 0 1200 250" className="w-full h-auto text-ink fill-current">
          <text 
            x="50%" 
            y="220" 
            dominantBaseline="baseline" 
            textAnchor="middle" 
            className="font-display font-bold uppercase tracking-tighter" 
            fontSize="280"
          >
            STORY
          </text>
        </svg>
      </div>

      <div className="container-site pb-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Get to Know ME</p>
        <h1 className="mt-3 max-w-3xl font-display text-display-md">
          Based in Manchester, United Kingdom. Photographing people, brands and products since 2020
        </h1>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <PlaceholderImage label="Benedict Henry — portrait" ratio="4 / 5" />
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-ink/50">Contact</dt>
                <dd>
                  <a href={`tel:${siteConfig.phoneE164}`} className="underline underline-offset-4">
                    {siteConfig.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink/50">Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.email}`} className="underline underline-offset-4 break-all">
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink/50">Location</dt>
                <dd>{siteConfig.locationLine}</dd>
              </div>
            </dl>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-accent"
            >
              Book / Get in touch
            </a>
          </div>

          <article className="prose-none max-w-2xl space-y-6 text-[1.05rem] leading-relaxed text-ink/80">
            <p className="font-display text-xl italic text-ink">A Bit About Me</p>
            <p className="font-semibold text-ink">Benedict Henry | SH Photography</p>

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
