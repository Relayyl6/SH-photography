import { socialLinks } from "@/lib/site-config";

export function SocialLinks({ className = "" }: { className?: string }) {
  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <ul className={`flex items-center gap-5 ${className}`}>
      {socialLinks.map((link) => (
        <li key={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-xs sm:text-sm font-medium tracking-wider uppercase text-ink/80 hover:text-accent transition-colors underline-offset-4 hover:underline"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
