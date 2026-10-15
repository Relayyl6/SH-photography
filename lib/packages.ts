// Seeded packages (CONTENT.md §6, DATA-MODEL.md `packages`).
// Tailored to the SH Photography brand — vibrant, authentic storytelling
// by Benedict Henry in Manchester, UK. show_price is false by default.

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

export const packages: Package[] = [
  {
    slug: "birthdays",
    name: "Birthdays",
    category: "photography",
    summary:
      "Vibrant, candid celebration coverage that captures every genuine laugh, surprise toast, and unforgettable milestone.",
    includes: [
      "Pre-event consultation to map out key moments, family groupings, and schedule",
      "Full documentary coverage of celebrations, guest arrivals, cake cutting, and festivities",
      "High-resolution edited digital gallery delivered in an interactive private portal",
      "Full personal download and printing release with expedited sneak peeks within 48 hours",
    ],
    notes: "Available for private parties, milestone celebrations, and venue events across Manchester and beyond.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "weddings",
    name: "Weddings",
    category: "photography",
    summary:
      "Cinematic, documentary wedding storytelling capturing raw emotion, quiet intimacy, and timeless romance.",
    includes: [
      "Creative consultation and bespoke wedding-day timeline coordination",
      "Full-day coverage from morning preparations through evening celebrations",
      "Handcrafted signature color grading and editorial skin retouching on select portraits",
      "Private online client gallery with full-resolution downloads and print licensing",
      "Curated sneak peek highlights delivered within 48 hours",
    ],
    notes: "Available throughout Greater Manchester, nationwide across the UK, and for destination weddings worldwide.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "anniversaries",
    name: "Anniversaries",
    category: "photography",
    summary:
      "Romantic, evocative couple and family portraiture honoring your enduring journey and shared milestones.",
    includes: [
      "Pre-shoot styling and location guidance (outdoor, home, or studio)",
      "Relaxed, natural posing direction focused on genuine connection and affection",
      "Signature retouching with authentic color tones and timeless black-and-white edits",
      "High-resolution digital collection ready for custom framing and legacy albums",
    ],
    notes: "Studio hire or travel fees may apply depending on your chosen location.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "graduations",
    name: "Graduations",
    category: "photography",
    summary:
      "Distinguished, dynamic portraiture celebrating your hard-earned academic triumph and next chapter.",
    includes: [
      "Editorial cap-and-gown formal portraits plus contemporary relaxed lifestyle shots",
      "Campus architectural backdrops and celebratory group portraits with family and mentors",
      "Fast 5-day delivery turnaround optimized for graduation announcements and social media",
      "High-resolution files with lifetime printing and personal publication release",
    ],
    notes: "Available for University of Manchester, MMU, Salford, and institutions across the North West.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "general-photography",
    name: "General Photography",
    category: "photography",
    summary:
      "Tailored visual storytelling for commercial brands, lifestyle campaigns, editorial features, and creative commissions.",
    includes: [
      "Creative direction, concept development, and shot list coordination",
      "Professional location lighting setup or studio-grade arrangements",
      "High-end retouching, color consistency, and brand aesthetic alignment",
      "Flexible commercial licensing packages tailored to digital, social, and print campaigns",
    ],
    notes: "Every commercial brief is custom-quoted according to licensing scope and production requirements.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },
  {
    slug: "general-photography-classes",
    name: "General Photography Classes",
    category: "class",
    summary:
      "Hands-on photography masterclasses covering manual camera control, composition, natural lighting, and visual storytelling.",
    includes: [
      "Complete mastery of manual exposure: shutter speed, aperture, ISO, and focal length",
      "Visual composition rules, frame balance, and mastering natural & artificial light",
      "Practical shooting exercises with live feedback and constructive portfolio review",
      "Comprehensive student cheat-sheet and gear recommendation guide for your budget",
    ],
    notes: "Available 1:1 or in small cohorts — join virtually from anywhere in the world or in-person in Manchester.",
    format: "both",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Book this",
  },
  {
    slug: "retouching-classes",
    name: "Retouching Classes",
    category: "class",
    summary:
      "Industry-standard editorial skin retouching masterclasses teaching frequency separation, dodge & burn, and color grading.",
    includes: [
      "Non-destructive workflow architecture in Adobe Photoshop and Lightroom",
      "Advanced skin texture preservation using frequency separation and micro dodge & burn",
      "Professional skin tone harmonization, color grading, and editorial mood creation",
      "Includes high-resolution practice RAW files, custom Photoshop brushes, and session recordings",
    ],
    notes: "Available online via screen-share or in-person in Manchester. Suitable for all skill levels from beginner to advanced.",
    format: "both",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Book this",
  },
];

export const packageQuoteCopy =
  "Every shoot is tailored. Final pricing depends on your location, studio choice and requirements. Get in touch for a personalised quote.";
