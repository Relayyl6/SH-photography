import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message or request a booking.",
};

export default function ContactPage() {
  return (
    <>
      <div className="container-site pt-12 md:pt-20 pb-0">
        
        <div className="grid gap-12 lg:gap-20 lg:grid-cols-[1fr_1.3fr]">
          {/* Left Column: Headline and Quick Contact */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Let&apos;s talk</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Send a message<br />or request a<br />booking
            </h1>
            <p className="mt-6 text-lg text-ink/70 max-w-md">I&apos;ll get back to you as soon as I can.</p>

            <div className="mt-16 md:mt-24 space-y-12 mb-8 md:mb-12">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-5">Quick contact</h2>
                <ul className="space-y-4">
                  <li>
                    <a href={`https://wa.me/${siteConfig.whatsappE164}`} target="_blank" rel="noopener noreferrer" className="font-display text-2xl hover:text-accent transition-colors">
                      WhatsApp me →
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${siteConfig.email}`} className="font-display text-2xl hover:text-accent break-all transition-colors">
                      Email me →
                    </a>
                  </li>
                  <li>
                    <a href={`tel:${siteConfig.phoneE164}`} className="font-display text-2xl hover:text-accent transition-colors">
                      {siteConfig.phoneDisplay}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-3">Location</p>
                <p className="text-lg text-ink/80">{siteConfig.locationLine}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-4">Follow</p>
                <SocialLinks className="mt-3" />
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="mt-8 lg:mt-0 mb-8 md:mb-12">
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden select-none pointer-events-none leading-none flex items-end">
        <svg viewBox="0 0 1400 215" className="w-full h-auto text-ink fill-current">
          <text 
            x="50%" 
            y="215" 
            dominantBaseline="baseline" 
            textAnchor="middle" 
            className="font-display font-bold uppercase tracking-tighter" 
            fontSize="300"
          >
            CONTACT
          </text>
        </svg>
      </div>
    </>
  );
}
