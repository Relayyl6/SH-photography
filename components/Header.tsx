"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { sessions } from "@/lib/sessions";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/animations";

const mobileMenuVariant = {
  hidden: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easing, staggerChildren: 0.05, delayChildren: 0.1 } }
};

const mobileItemVariant = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easing } }
};

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/style", label: "Style" },
  { href: "/services", label: "Services & Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPortfolioOpen(false);
        setMobileOpen(false);
      }
    }
    
    function onClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setPortfolioOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header 
      ref={headerRef} 
      className="sticky z-[100] w-full container-site top-3 pointer-events-none"
    >
      <div className={`relative rounded-full border border-line/60 backdrop-blur-md transition-all duration-300 pointer-events-auto ${scrolled ? 'bg-paper/95 shadow-md' : 'bg-paper/75 shadow-sm'}`}>
        <div className="flex items-center justify-between px-5 sm:px-6 md:px-8 h-16 md:h-18">
          <Link href="/" className="inline-flex items-center group py-0.5">
            <Image
              src="/logo.png"
              alt="SH Photography"
              width={140}
              height={100}
              className="w-auto object-contain transition-opacity duration-300 group-hover:opacity-80 h-10 md:h-12"
              priority
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            <div className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={portfolioOpen}
                onClick={() => setPortfolioOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide hover:text-accent"
              >
                Portfolio
                <span aria-hidden="true">{portfolioOpen ? "−" : "+"}</span>
              </button>
              {portfolioOpen && (
                <ul
                  role="menu"
                  aria-label="Portfolio sessions"
                  className="absolute left-0 top-full mt-3 w-56 rounded-2xl border border-line bg-paper py-2 shadow-xl"
                >
                  <li role="none">
                    <Link
                      role="menuitem"
                      href="/portfolio"
                      className="block px-4 py-2 text-sm font-semibold hover:bg-sand"
                      onClick={() => setPortfolioOpen(false)}
                    >
                      All sessions
                    </Link>
                  </li>
                  {sessions.map((s) => (
                    <li role="none" key={s.slug}>
                      <Link
                        role="menuitem"
                        href={`/portfolio/${s.slug}`}
                        className="block px-4 py-2 text-sm hover:bg-sand"
                        onClick={() => setPortfolioOpen(false)}
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-wide hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/book"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-accent inline-block"
              >
                Book
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink bg-transparent transition-colors duration-300 hover:bg-ink hover:text-paper inline-block"
              >
                Get in touch
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-line lg:hidden h-10 w-10"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span aria-hidden="true" className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav 
            variants={mobileMenuVariant}
            initial="hidden"
            animate="show"
            exit="hidden"
            id="mobile-menu" 
            aria-label="Mobile" 
            className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-3xl border border-line/60 bg-paper/95 backdrop-blur-xl shadow-xl lg:hidden overflow-hidden origin-top"
          >
            <ul className="flex flex-col gap-1 px-5 sm:px-6 py-6">
              <motion.li variants={mobileItemVariant}>
                <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-widest text-ink/50">
                  Portfolio
                </p>
              </motion.li>
              <motion.li variants={mobileItemVariant}>
                <Link href="/portfolio" className="block rounded-lg px-1 py-2 font-medium" onClick={() => setMobileOpen(false)}>
                  All sessions
                </Link>
              </motion.li>
              {sessions.map((s) => (
                <motion.li key={s.slug} variants={mobileItemVariant}>
                  <Link
                    href={`/portfolio/${s.slug}`}
                    className="block rounded-lg px-1 py-2 pl-4 text-ink/80"
                    onClick={() => setMobileOpen(false)}
                  >
                    {s.title}
                  </Link>
                </motion.li>
              ))}
              {navLinks.map((link) => (
                <motion.li key={link.href} variants={mobileItemVariant}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-1 py-3 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={mobileItemVariant} className="pt-4 pb-2 flex gap-2">
                <Link
                  href="/book"
                  className="block flex-1 rounded-full bg-ink px-5 py-3 text-center font-semibold text-paper"
                  onClick={() => setMobileOpen(false)}
                >
                  Book
                </Link>
                <Link
                  href="/contact"
                  className="block flex-1 rounded-full border border-ink px-5 py-3 text-center font-semibold text-ink bg-transparent"
                  onClick={() => setMobileOpen(false)}
                >
                  Get in touch
                </Link>
              </motion.li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
