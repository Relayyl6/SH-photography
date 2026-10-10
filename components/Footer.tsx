import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { SocialLinks } from "./SocialLinks";
import { sessions } from "@/lib/sessions";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line/50 bg-paper text-ink">
      
      {/* Massive Dark CTA Block with Blurred/Faded Edges */}
      <div className="w-full relative z-20">
        <div className="h-12 md:h-20 bg-gradient-to-b from-paper to-[#15130f]"></div>
        
        <div className="w-full bg-[#15130f] text-paper py-6 md:py-10">
          <div className="container-site flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
              <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight mb-4 text-[#f6f4f0]">
                Let&apos;s make something.
              </h2>
              <p className="text-paper/70 text-lg md:text-xl font-medium">
                Photographing people, brands and products since 2020.
              </p>
            </div>
            <div className="shrink-0">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-full bg-[#e8491c] px-8 py-4 text-sm md:text-base font-semibold text-white hover:bg-white hover:text-ink transition-colors duration-300"
              >
                Book / Get in touch
              </Link>
            </div>
          </div>
        </div>
        
        <div className="h-12 md:h-20 bg-gradient-to-b from-[#15130f] to-paper"></div>
      </div>

      <div className="container-site relative z-10 pb-48 pt-16 lg:pb-72">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            {siteConfig.businessName}
          </Link>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Col 1: Portfolio / Sessions */}
          <div>
            <p className="mb-6 text-sm font-semibold text-ink/40 uppercase tracking-widest">Portfolio</p>
            <ul className="space-y-4 text-sm font-medium text-ink/80">
              <li><Link href="/portfolio" className="hover:text-accent transition-colors">All sessions</Link></li>
              {sessions.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link href={`/portfolio/${s.slug}`} className="hover:text-accent transition-colors">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Col 2: Services */}
          <div>
            <p className="mb-6 text-sm font-semibold text-ink/40 uppercase tracking-widest">Services</p>
            <ul className="space-y-4 text-sm font-medium text-ink/80">
              <li><Link href="/services" className="hover:text-accent transition-colors">Packages &amp; Pricing</Link></li>
              <li><Link href="/services#classes" className="hover:text-accent transition-colors">Photography Classes</Link></li>
              <li><Link href="/services#retouching" className="hover:text-accent transition-colors">Retouching</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <p className="mb-6 text-sm font-semibold text-ink/40 uppercase tracking-widest">Contact</p>
            <ul className="space-y-4 text-sm font-medium text-ink/80">
              <li>
                <a href={`tel:${siteConfig.phoneE164}`} className="hover:text-accent transition-colors">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-accent transition-colors break-all">
                  {siteConfig.email}
                </a>
              </li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Book a session</Link></li>
            </ul>
          </div>

          {/* Col 4: About Us */}
          <div>
            <p className="mb-6 text-sm font-semibold text-ink/40 uppercase tracking-widest">About us</p>
            <ul className="space-y-4 text-sm font-medium text-ink/80">
              <li><Link href="/about" className="hover:text-accent transition-colors">About SH</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 5: Social Media */}
          <div>
            <p className="mb-6 text-sm font-semibold text-ink/40 uppercase tracking-widest">Social Media</p>
            <SocialLinks className="!flex-col !items-start gap-4 text-sm font-medium text-ink/80" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 flex flex-col justify-between gap-4 text-sm font-medium text-ink/60 md:flex-row md:items-center">
          <p>Copyright {siteConfig.businessName} {new Date().getFullYear()}</p>
          <p>❤️ Made with love in Manchester</p>
        </div>
      </div>

      {/* Landscape Illustration */}
      <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none">
        <Image 
          src="/footer-landscape.jpg"
          alt="Landscape Illustration"
          width={1920}
          height={600}
          className="w-full h-auto object-cover object-bottom opacity-95 mix-blend-multiply"
        />
      </div>
    </footer>
  );
}
