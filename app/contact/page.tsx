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
      <div className="container-site pt-20 pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Let&apos;s talk</p>
        <h1 className="mt-3 max-w-2xl font-display text-display-lg">
          Send a message or request a booking
        </h1>
        <p className="mt-4 max-w-xl text-ink/70">I&apos;ll get back to you as soon as I can.</p>

        <div className="mt-14 grid gap-16 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Quick contact</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`https://wa.me/${siteConfig.whatsappE164}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-xl hover:text-accent"
                >
                  WhatsApp me →
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="font-display text-xl hover:text-accent break-all">
                  Email me →
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.phoneE164}`} className="font-display text-xl hover:text-accent">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
            </ul>

            <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-ink/50">Location</p>
            <p className="mt-2 text-ink/70">{siteConfig.locationLine}</p>

            <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-ink/50">Follow</p>
            <SocialLinks className="mt-3" />
          </div>

          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>
      </div>

      <div className="w-full overflow-hidden select-none pointer-events-none pb-4 mt-6">
        <svg viewBox="0 0 1400 300" className="w-full h-auto text-ink fill-current">
          <text 
            x="50%" 
            y="250" 
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
