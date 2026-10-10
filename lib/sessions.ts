// The client's exact session list (CONTENT.md §3 / client_spec.md A5).
// Do not add sessions without client confirmation (AGENTS.md §5 rule 3).

export type Session = {
  slug: string;
  title: string;
  intro: string; // [SUGGESTED] placeholder until client approves
  previewCount: number; // how many preview photos to render as placeholders
  galleryCount: number;
};

export const sessions: Session[] = [
  {
    slug: "family",
    title: "Family",
    intro: "[PLACEHOLDER: Family intro line — one sentence, warm, first person]",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "portraits",
    title: "Portraits",
    intro: "[PLACEHOLDER: Portrait intro line]",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "weddings",
    title: "Weddings",
    intro: "[PLACEHOLDER: Weddings intro line]",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "behind-the-scenes",
    title: "Behind the Scenes",
    intro: "[PLACEHOLDER: Behind the scenes intro line]",
    previewCount: 6,
    galleryCount: 20,
  },
  {
    slug: "corporate",
    title: "Corporate",
    intro: "[PLACEHOLDER: Corporate intro line]",
    previewCount: 6,
    galleryCount: 20,
  },
];

export function getSession(slug: string) {
  return sessions.find((s) => s.slug === slug);
}
