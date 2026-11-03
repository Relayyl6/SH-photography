"use client";

import { useEffect, useState } from "react";
import { socialLinks as defaultSocialLinks } from "@/lib/site-config";
import { getSocialSettings } from "@/lib/content";

export interface SocialLinkItem {
  platform: string;
  url: string;
  label?: string;
  visible?: boolean;
}

export function SocialLinks({
  className = "",
  itemClassName = "",
  links,
}: {
  className?: string;
  itemClassName?: string;
  links?: SocialLinkItem[];
}) {
  const [activeLinks, setActiveLinks] = useState<SocialLinkItem[]>(links || defaultSocialLinks);

  useEffect(() => {
    if (links && links.length > 0) {
      setActiveLinks(links.filter((l) => l.visible !== false));
      return;
    }

    async function loadLiveSocial() {
      try {
        const soc = await getSocialSettings();
        if (soc?.links && soc.links.length > 0) {
          const visible = soc.links.filter((l) => l.visible !== false && Boolean(l.url));
          if (visible.length > 0) {
            setActiveLinks(visible);
          }
        }
      } catch (err) {
        // Fallback to static
      }
    }
    loadLiveSocial();
  }, [links]);

  if (!activeLinks || activeLinks.length === 0) {
    return null;
  }

  return (
    <ul className={`flex items-center gap-5 ${className}`}>
      {activeLinks.map((link) => (
        <li key={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label || link.platform}
            className={`text-xs sm:text-sm font-medium tracking-wider uppercase text-ink/80 hover:text-accent transition-colors underline-offset-4 hover:underline ${itemClassName}`}
          >
            {link.label || link.platform}
          </a>
        </li>
      ))}
    </ul>
  );
}
