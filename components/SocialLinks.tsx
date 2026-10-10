import { socialLinks } from "@/lib/site-config";

// Reads social_links (DATA-MODEL.md); handles an empty set gracefully
// (DATA-MODEL.md §3 — no broken icons when none are supplied yet).
export function SocialLinks({ className = "" }: { className?: string }) {
  if (socialLinks.length === 0) {
    return (
      <p className={`text-sm text-ink/50 ${className}`}>
        [PLACEHOLDER: social links — Instagram / Facebook / TikTok / YouTube]
      </p>
    );
  }

  return (
    <ul className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((link) => (
        <li key={link.platform}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-sm font-medium uppercase tracking-wide underline-offset-4 hover:underline"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
