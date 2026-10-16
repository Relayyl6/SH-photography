"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site-config";
import { SocialLinks } from "./SocialLinks";
import { sessions } from "@/lib/sessions";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isStylePage = pathname === "/style";

  return (
    <footer className={`relative overflow-hidden text-ink bg-paper ${isStylePage ? '' : 'mt-24 border-t border-line/50'}`}>
      
      {/* Editorial Typographic CTA */}
      <div className={`relative z-20 container-site text-center flex flex-col items-center justify-center ${isStylePage ? 'mb-10 md:mb-16' : 'my-10 md:my-16'}`}>
        
        {/* Floating elements for left and right - placed higher on mobile/tab to never overlap buttons */}
        <motion.div 
          animate={{ y: [0, -14, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1 sm:left-4 md:left-6 lg:left-12 top-2 sm:top-4 md:top-1/2 md:-translate-y-1/2 w-16 h-16 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-56 lg:h-56 pointer-events-none drop-shadow-md z-0 transform-gpu will-change-transform"
        >
          <Image src="/floating-camera.png" alt="Vintage Camera" fill className="object-contain" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 14, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-1 sm:right-4 md:right-6 lg:right-12 top-2 sm:top-4 md:top-1/2 md:-translate-y-1/2 w-16 h-16 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-56 lg:h-56 pointer-events-none drop-shadow-md z-0 transform-gpu will-change-transform"
        >
          <Image src="/floating-lens.png" alt="Camera Lens" fill className="object-contain" />
        </motion.div>

        <p className="text-accent text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 relative z-10">
          Ready to create together?
        </p>
        
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none tracking-tighter text-ink mb-3 relative z-10 px-6 sm:px-0">
          Let&apos;s make <span className="italic uppercase text-ink/70">MAGIC.</span>
        </h2>
        
        <p className="text-ink/70 text-sm md:text-base font-medium max-w-lg mx-auto mb-6 relative z-10 px-4 sm:px-0">
          Photographing people, brands and products since 2020. I&apos;d love to hear about your next project.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[280px] sm:max-w-none sm:w-auto relative z-10">
          <Link
            href="/book"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-paper hover:bg-accent transition-colors duration-300 shadow-sm"
          >
            Book a Session
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-ink/20 px-8 py-3.5 text-sm font-semibold text-ink hover:border-ink hover:bg-sand transition-colors duration-300"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <div className="container-site relative z-10 pb-48 pt-16 lg:pb-72">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="inline-block group">
            <Image
              src="/logo.png"
              alt="SH Photography"
              width={160}
              height={120}
              className="h-16 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
            />
          </Link>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Col 1: Portfolio / Sessions */}
          <div>
            <p className="mb-6 text-sm font-semibold text-ink/40 uppercase tracking-widest">Portfolio</p>
            <ul className="space-y-4 text-sm font-medium text-ink/80">
              <li><Link href="/portfolio" className="hover:text-accent transition-colors">All sessions</Link></li>
              {sessions.slice(0, 6).map((s) => (
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
              <li><Link href="/book" className="hover:text-accent transition-colors">Book a session</Link></li>
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
