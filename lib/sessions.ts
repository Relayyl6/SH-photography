// Core sessions and event categories for SH Photography by Benedict Henry.
// Reflects the client's real portfolio folders plus placeholders for events without a local folder.

export type Session = {
  slug: string;
  title: string;
  intro: string;
  previewCount: number;
  galleryCount: number;
  featuredImage?: string;
};

export const sessions: Session[] = [
  {
    slug: "weddings",
    title: "Weddings",
    intro:
      "Unscripted love stories documented with cinematic emotion, quiet intimacy, and a discerning eye for fleeting, magical moments.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/weddings/weddings_01.jpg",
  },
  {
    slug: "portraits",
    title: "Portraits",
    intro:
      "Character-driven beauty and individual portraits sculpted with natural light and refined elegance, celebrating who you truly are.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/portraits/portraits_01.jpg",
  },
  {
    slug: "family",
    title: "Family",
    intro:
      "Honest warmth, spontaneous laughter, and tender milestones that define your family's story — relaxed, unhurried, and authentic.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/family/family_01.jpg",
  },
  {
    slug: "behind-the-scenes",
    title: "Behind the Scenes",
    intro:
      "Documenting the creative energy, intense craft, and genuine camaraderie unfolding behind the camera on set and stage.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/behind-the-scenes/behind-the-scenes_01.jpg",
  },
  {
    slug: "events",
    title: "Events",
    intro:
      "Dynamic gatherings, social galas, and live celebratory occasions captured with an editorial eye for atmosphere and spontaneous joy.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/events/events_01.jpg",
  },
  {
    slug: "sports",
    title: "Sports & Athletics",
    intro:
      "High-octane action, athletic intensity, and triumphant decisive moments captured with precision timing and dramatic framing.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/sports/sports_01.jpg",
  },
  {
    slug: "birthday",
    title: "Birthdays",
    intro:
      "Milestone celebrations filled with genuine laughter, champagne toasts, candlelight, and unforgettable memories.",
    previewCount: 6,
    galleryCount: 24,
    featuredImage: "/photos/birthday/birthday_01.jpg",
  },
  {
    slug: "personal",
    title: "Personal Branding",
    intro:
      "Bespoke individual portraits and creative personal lifestyle sessions celebrating individual identity and unique character.",
    previewCount: 6,
    galleryCount: 9,
    featuredImage: "/photos/personal/personal_01.jpg",
  },
];

export function getSession(slug: string) {
  return sessions.find((s) => s.slug === slug);
}
