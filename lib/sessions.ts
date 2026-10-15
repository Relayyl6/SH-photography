// The client's exact session list (CONTENT.md §3 / client_spec.md A5).
// Five core sessions for SH Photography by Benedict Henry.

export type Session = {
  slug: string;
  title: string;
  intro: string;
  previewCount: number;
  galleryCount: number;
};

export const sessions: Session[] = [
  {
    slug: "family",
    title: "Family",
    intro:
      "I capture the honest warmth, spontaneous laughter, and tender milestones that define your family's story — relaxed, unhurried, and authentic.",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "portraits",
    title: "Portraits",
    intro:
      "Character-driven beauty and individual portraits sculpted with natural light and refined elegance, celebrating who you truly are.",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "weddings",
    title: "Weddings",
    intro:
      "Unscripted love stories documented with cinematic emotion, quiet intimacy, and a discerning eye for the fleeting, magical moments.",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "behind-the-scenes",
    title: "Behind the Scenes",
    intro:
      "Documenting the creative energy, intense craft, and genuine camaraderie unfolding behind the camera on set and behind the stage.",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "corporate",
    title: "Corporate",
    intro:
      "Contemporary executive headshots and brand lifestyle imagery crafted to elevate your professional presence with warmth and confidence.",
    previewCount: 6,
    galleryCount: 20,
  },
];

export function getSession(slug: string) {
  return sessions.find((s) => s.slug === slug);
}
