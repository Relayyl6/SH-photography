// Seeded packages (CONTENT.md §6, DATA-MODEL.md `packages`). No names,
// inclusions or prices were supplied by the client — every summary/includes
// line here is a clearly marked placeholder for the client (or admin, once
// built) to replace. show_price is false by default and never overridden.

export type Package = {
  slug: string;
  name: string;
  category: "photography" | "class";
  summary: string;
  includes: string[];
  notes?: string;
  format?: "online" | "in_person" | "both";
  showPrice: boolean;
  priceLabel: string | null;
  ctaLabel: string;
};

const placeholderIncludes = (n: number) =>
  Array.from({ length: n }, (_, i) => `[PLACEHOLDER: bullet ${i + 1}]`);

export const packages: Package[] = [
  {
    slug: "birthdays",
    name: "Birthdays",
    category: "photography",
    summary: "[PLACEHOLDER: one-line summary]",
    includes: placeholderIncludes(3),
    notes: "Studio hire may add to cost depending on location.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "weddings",
    name: "Weddings",
    category: "photography",
    summary: "[PLACEHOLDER: one-line summary]",
    includes: placeholderIncludes(3),
    notes: "Studio hire may add to cost depending on location.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "anniversaries",
    name: "Anniversaries",
    category: "photography",
    summary: "[PLACEHOLDER: one-line summary]",
    includes: placeholderIncludes(3),
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "graduations",
    name: "Graduations",
    category: "photography",
    summary: "[PLACEHOLDER: one-line summary]",
    includes: placeholderIncludes(3),
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "general-photography",
    name: "General Photography",
    category: "photography",
    summary: "All photography-related services.",
    includes: placeholderIncludes(3),
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "general-photography-classes",
    name: "General Photography Classes",
    category: "class",
    summary: "[PLACEHOLDER: one-line summary]",
    includes: placeholderIncludes(3),
    format: "both",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Book this",
  },
  {
    slug: "retouching-classes",
    name: "Retouching Classes",
    category: "class",
    summary: "[PLACEHOLDER: one-line summary]",
    includes: placeholderIncludes(3),
    format: "both",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Book this",
  },
];

export const packageQuoteCopy =
  "Every shoot is tailored. Final pricing depends on your location, studio choice and requirements. Get in touch for a personalised quote.";
