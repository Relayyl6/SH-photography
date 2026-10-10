"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sessions } from "@/lib/sessions";

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
      className={`sticky z-[100] w-full container-site transition-all duration-500 ease-in-out ${scrolled ? 'top-2' : 'top-4'}`}
    >
      <div className="relative rounded-full border border-line/60 bg-paper/70 backdrop-blur-md shadow-sm pointer-events-auto">
        <div className={`flex items-center justify-between px-5 sm:px-6 md:px-8 transition-all duration-500 ease-in-out ${scrolled ? 'h-12 md:h-14' : 'h-16 md:h-20'}`}>
          <Link href="/" className={`font-display tracking-tight transition-all duration-500 ${scrolled ? 'text-lg' : 'text-xl'}`}>
            {"SH Photography"}
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
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
            <Link
              href="/contact"
              className={`hidden rounded-full bg-ink text-sm font-semibold text-paper transition-all duration-500 hover:bg-accent md:inline-block ${scrolled ? 'px-4 py-2' : 'px-5 py-2.5'}`}
            >
              Book / Get in touch
            </Link>
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-full border border-line md:hidden transition-all duration-500 ${scrolled ? 'h-8 w-8' : 'h-10 w-10'}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span aria-hidden="true" className={scrolled ? "text-base" : "text-lg"}>{mobileOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav 
          id="mobile-menu" 
          aria-label="Mobile" 
          className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-3xl border border-line/60 bg-paper/95 backdrop-blur-xl shadow-xl md:hidden overflow-hidden origin-top animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <ul className="flex flex-col gap-1 px-5 sm:px-6 py-4">
            <li>
              <p className="px-1 pb-1 pt-3 text-xs font-semibold uppercase tracking-widest text-ink/50">
                Portfolio
              </p>
            </li>
            <li>
              <Link href="/portfolio" className="block rounded-lg px-1 py-2 font-medium" onClick={() => setMobileOpen(false)}>
                All sessions
              </Link>
            </li>
            {sessions.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/portfolio/${s.slug}`}
                  className="block rounded-lg px-1 py-2 pl-4 text-ink/80"
                  onClick={() => setMobileOpen(false)}
                >
                  {s.title}
                </Link>
              </li>
            ))}
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-1 py-3 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/contact"
                className="block rounded-full bg-ink px-5 py-3 text-center font-semibold text-paper"
                onClick={() => setMobileOpen(false)}
              >
                Book / Get in touch
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
